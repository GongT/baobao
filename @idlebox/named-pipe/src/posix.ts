import { isNotExistsError } from '@idlebox/common';
import { execa } from 'execa';
import { constants } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PassThrough, type Readable, type Writable } from 'node:stream';
import { NamedPipeBase, type IOptions } from './fn/abs.js';
import { FileDescriptor } from './fn/always-open.js';
import { BufferStream } from './fn/buffer-stream.js';

export class NamedPipePosix extends NamedPipeBase {
	public readonly mode;

	constructor(path: string, options: IOptions = {}) {
		if (!path.startsWith('/')) {
			throw new Error(`仅允许绝对路径: ${path}`);
		}

		super(resolve(path), options);

		let mode = options.mode;
		if (mode === undefined) {
			mode = 0o666;
		} else {
			mode = mode & 0o777;
		}
		// biome-ignore lint/style/useTemplate: simple
		this.mode = '0' + mode.toString(8);
	}

	private isCreateByMe = false;
	protected override async _create() {
		try {
			const ss = await stat(this.path);
			if (ss.isFIFO()) {
				this.logger.verbose`文件已存在且是FIFO`;
				return;
			} else {
				if (ss.size > 0) {
					throw new Error(`文件存在但不是FIFO: ${this.path}`);
				} else {
					this.logger.verbose`删除空的非FIFO文件`;
					await unlink(this.path);
				}
			}
		} catch (e: unknown) {
			if (!isNotExistsError(e)) {
				throw e;
			}
		}

		this.logger.verbose`mkfifo ${this.path} --mode ${this.mode}`;
		await execa`mkfifo ${this.path} --mode ${this.mode}`;
		this.isCreateByMe = true;
	}

	protected override async _read(): Promise<Readable> {
		// 打开文件读取，模仿 tail -f 的行为，EOF时立刻重新打开
		const passthrough = new PassThrough({ objectMode: true, highWaterMark: 0 });
		const { promise, reject, resolve } = Promise.withResolvers<void>();

		const fdHolder = new FileDescriptor(this.path, constants.O_RDONLY | constants.O_NONBLOCK, this.logger);
		this.registerInner(fdHolder);

		fdHolder.onOpen((socket) => {
			this.logger.verbose`文件已打开，启动管道`;
			socket.pipe(passthrough, { end: false }); // 桥接输出，忽略EOF
		});
		fdHolder.onOpen.once(() => resolve());

		fdHolder.onClose((socket) => {
			this.logger.verbose`文件已关闭`;
			socket.unpipe();
		});
		fdHolder.onError((e) => {
			this.logger.error`打开文件失败: ${e}`;
			passthrough.destroy(e);
		});
		fdHolder.onError.once(reject);

		fdHolder.onDispose(() => {
			passthrough.end();
		});

		fdHolder.open();

		await promise;

		return passthrough;
	}

	protected override async _write(): Promise<Writable> {
		const passthrough = new PassThrough({ objectMode: true, highWaterMark: 0 });
		const { promise, reject, resolve } = Promise.withResolvers<void>();

		const fdHolder = new FileDescriptor(this.path, constants.O_WRONLY | constants.O_NONBLOCK, this.logger);
		this.registerInner(fdHolder);

		const bufferStream = passthrough.pipe(new BufferStream(), { end: true });

		fdHolder.onOpen((socket) => {
			this.logger.verbose`文件已打开，启动管道`;
			bufferStream.pipe(socket);
		});
		fdHolder.onOpen.once(() => resolve());

		fdHolder.onClose((socket) => {
			this.logger.verbose`文件已关闭`;
			bufferStream.unpipe(socket);
		});
		fdHolder.onError((e) => {
			this.logger.error`打开文件失败: ${e}`;
			passthrough.destroy(e);
		});
		fdHolder.onError.once(reject);

		fdHolder.onDispose(() => {
			passthrough.end();
		});

		fdHolder.open();

		await promise;

		return passthrough;
	}

	protected override async _close(_graceful: boolean): Promise<void> {
		if (this.isCreateByMe) {
			this.logger.verbose`删除管道文件: ${this.path}`;
			await unlink(this.path).catch(ignoreNotExistsError);
		} else {
			this.logger.verbose`不删除管道文件: ${this.path} (不是我创建的)`;
		}
	}
}

function ignoreNotExistsError(e: any) {
	if (isNotExistsError(e)) {
		// 文件不存在，忽略
	} else {
		throw e;
	}
}
