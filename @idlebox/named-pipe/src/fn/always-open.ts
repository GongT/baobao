/**
 * 注意: 本文件中不应出现关闭socket的行为
 * 所有打开与关闭都操作fd
 */

import { Emitter, ExponentialBackoff, isLinuxError, LinuxErrorCode, sleep } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import assert from 'node:assert';
import { close as fsCloseAsync, open as fsOpenAsync } from 'node:fs';
import { constants } from 'node:fs/promises';
import { Socket } from 'node:net';
import { promisify } from 'node:util';

const fsOpen = promisify(fsOpenAsync);
const fsClose = promisify(fsCloseAsync);

const O_ACCMODE = constants.O_RDONLY | constants.O_WRONLY | constants.O_RDWR; // 3

export class FileDescriptor {
	private readonly retry = ExponentialBackoff.forLocal({ maxDelay: 3000 });
	private fd?: number;

	private readonly _onOpen = new Emitter<Socket>();
	public readonly onOpen = this._onOpen.event;

	private readonly _onClose = new Emitter<Socket>();
	public readonly onClose = this._onClose.event;

	private readonly _onError = new Emitter<Error>();
	public readonly onError = this._onError.event;

	private readonly _onDispose = new Emitter<void>();
	public readonly onDispose = this._onDispose.event;

	constructor(
		private readonly path: string,
		private readonly flags: number,
		private readonly logger: IMyLogger,
	) {
		// nodejs中对FIFO使用阻塞API将彻底卡死进程 且完全无法捕获、恢复，必须小心
		assert.ok(flags & constants.O_NONBLOCK, 'flags必须包含O_NONBLOCK');
	}

	private isOpen = false;

	open() {
		if (this.isOpen) return;
		this.isOpen = true;

		this._open();
	}

	private async _open() {
		while (this.isOpen) {
			try {
				await this.deleteFd();
				assert.equal(this.fd, undefined);

				this.logger.debug`打开文件: ${this.path}，flags: ${this.flags}`;

				this.cleanupSocket();
				this.fd = await fsOpen(this.path, this.flags);
				this.logger.verbose`打开文件 - ok: fd=${this.fd}`;
				this.updateSocket();

				this.retry.reset();
				return;
			} catch (e: any) {
				this.logger.verbose`打开文件错误 ${e.code}`;

				if (isLinuxError(e, LinuxErrorCode.ENXIO)) {
					// 没有读端或写端，等待一段时间后重试
					const wait = this.retry.next();
					this.logger.verbose`等待${wait}ms后重试`;
					await sleep(wait);
					continue;
				}
				if (this._disposed) {
					return;
				}

				this.isOpen = false;
				this._onError.fire(e);
				break;
			}
		}
	}

	private socket?: Socket;
	private readonly views: Array<Socket> = [];
	private cleanupSocket() {
		if (this.socket) {
			this.logger.debug`断开socket对象`;
			this.socket.removeAllListeners();
			this._onClose.fire(this.socket);
			this.socket = undefined;
		}
	}
	private updateSocket() {
		assert.ok(!this.socket);
		assert.ok(this.fd);

		const rwflags = this.flags & O_ACCMODE;
		const readable = (rwflags & constants.O_RDONLY) !== 0 || rwflags === constants.O_RDONLY;
		const writable = (rwflags & constants.O_WRONLY) !== 0 || rwflags === constants.O_WRONLY;
		this.logger.debug`创建socket对象: fd=${this.fd}, flags=${this.flags}, readable=${readable}, writable=${writable}`;
		this.socket = new Socket({
			fd: this.fd,
			readable,
			writable,
		});
		this.views.push(this.socket);
		this.socket.once('end', () => {
			this.logger.verbose`EOF! (isOpen: ${this.isOpen})`;

			if (!this.isOpen) return;
			this._open(); // EOF时重新打开
		});
		this.socket.once('error', (e) => {
			this.logger.verbose`读取文件错误 ${e.message}`;

			this.close();
			this.open();
		});
		this._onOpen.fire(this.socket);
	}

	close() {
		if (!this.isOpen) return;
		this.isOpen = false;

		// cleanupSocket会删除socket上监听的事件，否则在close时会触发socket的error事件
		this.cleanupSocket();

		assert.ok(this.fd, 'close[isOpen=true]时fd不存在');
		this.deleteFd();
	}

	[Symbol.dispose]() {
		this.dispose();
	}

	private _disposed = false;
	dispose() {
		if (this._disposed) return;
		this._disposed = true;

		this._onDispose.fire();
		this.close();

		this._onOpen.dispose();
		this._onClose.dispose();
		this._onError.dispose();
		this._onDispose.dispose();
	}

	async deleteFd() {
		if (this.fd !== undefined) {
			await fsClose(this.fd)
				.catch(ignoreDuplicateCloseError)
				.finally(() => {
					this.logger.verbose`描述符已删除: fd=${this.fd}`;
					this.fd = undefined;
				});
		}

		if (this.views.length) {
			this.logger.debug`清理${this.views.length}个socket对象`;
			for (const view of this.views) {
				view.destroy();
			}
			this.views.length = 0;
		}
	}
}

function ignoreDuplicateCloseError(e: any) {
	if (isLinuxError(e, LinuxErrorCode.EBADF)) {
		// fd已经关闭，忽略
	} else {
		throw e;
	}
}
