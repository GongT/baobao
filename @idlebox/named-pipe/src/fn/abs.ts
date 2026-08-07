import { EnhancedAsyncDisposable, Mutex, registerGlobalLifecycle } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import assert from 'node:assert';
import { basename } from 'node:path';
import type { Readable, Writable } from 'node:stream';

export interface IOptions {
	/**
	 * linux权限，默认值为 0o666
	 */
	readonly mode?: number;
	/**
	 * 调试输出
	 */
	readonly logger?: IMyLogger;
}

export interface INamedPipe {
	/**
	 * 返回管道的路径
	 * 在windows上是 \\.\pipe\传入的绝对路径
	 * 在linux上是 传入的绝对路径
	 */
	readonly name: string;
	/**
	 * 创建管道，通常都不需要调用
	 */
	create(): Promise<void>;
	/**
	 * 只读打开
	 */
	read(): Promise<Readable>;
	/**
	 * 只写打开
	 */
	write(): Promise<Writable>;
	/**
	 * 关闭，可重新打开
	 * 返回false表示管道未打开
	 */
	close(): Promise<boolean>;
	/**
	 * 销毁，无法继续使用
	 */
	dispose(): Promise<void>;
	[Symbol.asyncDispose](): Promise<void>;
}

type MayPromise<T> = T | Promise<T>;

const ext = /\.[^/.]+$/;

export abstract class NamedPipeBase extends EnhancedAsyncDisposable implements INamedPipe {
	public readonly path: string;
	private readonly mu;
	protected readonly logger: IMyLogger;
	private innerLifecycle?: AsyncDisposableStack;

	constructor(path: string, options: IOptions) {
		super(`NamedPipe:${path}`);
		this.path = path;
		this.mu = this._register(new Mutex('NamedPipe'));
		this.logger = options.logger ?? createLogger(`pipe:${basename(path).replace(ext, '')}`);

		registerGlobalLifecycle(this, true);
	}

	get name() {
		return this.path;
	}

	protected registerInner(disposable: AsyncDisposable | Disposable | (() => MayPromise<void>)) {
		this.innerLifecycle ??= new AsyncDisposableStack();
		if (typeof disposable === 'function') {
			this.innerLifecycle.defer(disposable);
		} else {
			this.innerLifecycle.use(disposable);
		}
	}

	protected registerInnerObject<T>(object: T, dispose: (obj: T) => MayPromise<void>) {
		this.innerLifecycle ??= new AsyncDisposableStack();
		this.innerLifecycle.adopt(object, dispose);
	}

	private created = false;
	protected abstract _create(): Promise<void>;
	public async create() {
		if (this._opened_as_read) throw new Error('命名管道已用于写入，无法再次打开');
		if (this._opened_as_write) throw new Error('命名管道已用于读取，无法再次打开');
		if (this.disposed || this.disposing) throw new Error('命名管道已被释放，无法使用');

		if (this.created) return;
		this.created = true;

		this.innerLifecycle = new AsyncDisposableStack();

		this.logger.debug`创建命名管道`;
		await this._create();
	}

	get isCreated() {
		return this.created;
	}

	private _opened_as_read = false;
	protected abstract _read(): Promise<Readable>;
	public async read() {
		using _ = await this.mu.lock();

		await this.create();
		this._opened_as_read = true;
		this.logger.debug`以读取方式打开`;

		const stream = await this._read();

		stream.on('close', () => {
			if (this.closing) {
				this.logger.debug`读取流关闭成功！`;
			} else {
				this.logger.debug`读取方主动关闭`;
				this.close().then(
					(closed) => {
						assert.ok(closed, '流关闭时，管道应该已经打开');
					},
					(e) => {
						this.logger.error`关闭命名管道失败: ${e}`;
					},
				);
			}
			this._opened_as_read = false;
		});

		return stream;
	}

	private _opened_as_write = false;
	protected abstract _write(): Promise<Writable>;
	public async write() {
		using _ = await this.mu.lock();

		await this.create();
		this._opened_as_write = true;
		this.logger.debug`以写入方式打开`;

		const stream = await this._write();

		stream.on('close', () => {
			if (this.closing) {
				this.logger.debug`写入流关闭成功！`;
			} else {
				this.logger.debug`写入方主动关闭`;
				this.close().then(
					(closed) => {
						assert.ok(closed, '流关闭时，管道应该已经打开');
					},
					(e) => {
						this.logger.error`关闭命名管道失败: ${e}`;
					},
				);
			}
			this._opened_as_write = false;
		});

		return stream;
	}

	protected closing = false;
	protected abstract _close(graceful: boolean): Promise<void>;
	public async close() {
		if (!this._opened_as_read && !this._opened_as_write) return false;
		using _ = await this.mu.lock();
		this.logger.debug`外部控制主动关闭`;
		await this._criticalClose(true);
		return true;
	}

	private async _criticalClose(graceful: boolean) {
		try {
			this.closing = true;
			const stack = this.innerLifecycle;
			if (stack) {
				await stack.disposeAsync();
			}
			this.logger.debug`关闭管道: graceful=${graceful}`;
			await this._close(graceful);
			this.created = false;
		} finally {
			this.closing = false;
		}
	}

	public override async dispose() {
		if (this.disposed || this.disposing) return;
		this.logger.debug`销毁管道`;

		using _ = await this.mu.lock();
		await this._criticalClose(false);
		await super.dispose();
	}

	protected async unlocked() {
		await this.mu.waitUnLocked();
	}
}
