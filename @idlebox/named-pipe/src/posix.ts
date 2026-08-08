import { isNotExistsError, timeout } from '@idlebox/common';
import { execa, type Options } from 'execa';
import { constants } from 'node:fs';
import { stat, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PassThrough, type Readable, type Writable } from 'node:stream';
import { NamedPipeBase, type IOptions } from './fn/abs.js';
import { FileDescriptor } from './fn/posix/file-descriptor.js';
import { ClosedBy } from './fn/type.js';

function normalizeMode(mode: number | undefined): string {
	if (mode === undefined) {
		mode = 0o666;
	} else {
		mode = mode & 0o777;
	}
	// biome-ignore lint/style/useTemplate: simple
	return '0' + mode.toString(8);
}

abstract class NamedPipePosixCreate extends NamedPipeBase {
	public readonly mode;

	constructor(path: string, options: IOptions = {}) {
		if (!path.startsWith('/')) {
			throw new Error(`仅允许绝对路径: ${path}`);
		}

		super(resolve(path), options);

		this.mode = normalizeMode(options.mode);
	}

	protected override async _create() {
		try {
			const ss = await stat(this.path);
			if (ss.isFIFO()) {
				this.logger.verbose`文件已存在且是FIFO`;
				return;
			} else {
				if (ss.isFile() && ss.size === 0) {
					this.logger.verbose`删除空文件`;
					await unlink(this.path);
				} else {
					throw new Error(`文件存在但不是FIFO: ${this.path}`);
				}
			}
		} catch (e: unknown) {
			if (!isNotExistsError(e)) {
				throw e;
			}
		}

		this.logger.verbose`mkfifo ${this.path} --mode ${this.mode}`;
		await execa`mkfifo ${this.path} --mode ${this.mode}`;

		this.registerInner(async () => {
			this.logger.verbose`删除创建的管道文件: ${this.path}`;
			await unlink(this.path).catch(ignoreNotExistsError);
		});
	}
}

export class NamedPipePosixPure extends NamedPipePosixCreate {
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

		const fdHolder = new FileDescriptor(this.path, constants.O_WRONLY | constants.O_NONBLOCK, this.logger, false);
		this.registerInner(fdHolder);

		fdHolder.onOpen((socket) => {
			this.logger.verbose`文件已打开，启动管道`;
			passthrough.pipe(socket);
		});
		fdHolder.onOpen.once(() => resolve());

		fdHolder.onClose((socket) => {
			this.logger.verbose`文件已关闭`;
			passthrough.unpipe(socket);
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
}

/**
 * 调用tail -f读取
 * 调用cat写入
 */
export class NamedPipePosix extends NamedPipePosixCreate {
	private execute<T extends Options>(cmd: string[], options: T) {
		const passthrough = new PassThrough({ objectMode: true, highWaterMark: 0 });

		const p = execa({
			...options,
			buffer: false,
			reject: false,
			encoding: 'buffer',
			stderr: this.logger.verbose.isEnabled ? 'pipe' : 'ignore',
		})`${cmd}`;

		let killSent = false;
		const doKill = async () => {
			if (killSent) return;
			killSent = true;
			p.kill();
			try {
				await Promise.race([p, timeout(1000)]);
			} catch {
				this.logger.warn`commandline<${cmd}>未能在1秒内退出`;
				p.kill(9);
			}
		};
		let expectedExit = false;

		this.registerInner(async () => {
			expectedExit = true;
			if (killSent) return;

			this.logger.verbose`控制关闭，终止命令行`;
			doKill();
		});

		this.logger.debug`程序commandline<${cmd}>启动，pid=${p.pid}`;
		if (p.stderr) {
			p.stderr.on('data', (chunk) => {
				this.logger.verbose`[stderr] long<${chunk.toString()}>`;
			});
		}

		p.then(
			(result) => {
				killSent = true;
				this.triggerClose(ClosedBy.Target);

				this.logger.debug`程序${cmd[0]}退出: expectedExit=${expectedExit}, exitCode=${result.exitCode}`;
				if (expectedExit || result.exitCode === 0) {
					passthrough.end();
				} else {
					this.logger.verbose`通知Broken pipe`;
					const e = new Error(`Broken pipe file: ${this.path}`);
					Object.assign(e, { code: 'EPIPE', path: this.path });
					passthrough.destroy(e);
				}
			},
			() => {
				console.error(`execa with reject: false should never reject`);
				process.exit(1);
			},
		);

		return { p, passthrough };
	}

	protected override async _read(): Promise<Readable> {
		const { p, passthrough } = this.execute(['tail', '-f', this.path], {
			stdin: 'ignore',
			stdout: 'pipe',
		});

		// 理论上不应该用pipe
		p.stdout.pipe(passthrough, { end: false });

		passthrough.on('finish', () => {
			this.logger.debug`写入流关闭`;
		});

		passthrough.on('end', () => {
			this.logger.debug`读取流关闭`;
			this.triggerClose(ClosedBy.Consumer);
		});

		return passthrough;
	}

	protected override async _write(): Promise<Writable> {
		const { p, passthrough } = this.execute(['tee', this.path], {
			stdin: 'pipe',
			stdout: 'ignore',
		});

		p.stdin.on('error', (e) => {
			this.logger.error`stdin error: ${e}`;
		});
		passthrough.pipe(p.stdin, { end: true });

		passthrough.on('finish', () => {
			this.logger.debug`写入流关闭`;
			this.triggerClose(ClosedBy.Consumer);
		});

		passthrough.on('end', () => {
			this.logger.debug`读取流关闭`;
		});

		return passthrough;
	}
}

function ignoreNotExistsError(e: any) {
	if (isNotExistsError(e)) {
		// 文件不存在，忽略
	} else {
		throw e;
	}
}
