import { EnhancedAsyncDisposable, Mutex, registerGlobalLifecycle } from '@idlebox/common';
import { createLogger, type IMyLogger } from '@idlebox/logger';
import { basename } from 'node:path';
import type { Readable, Writable } from 'node:stream';
import { promisify } from 'node:util';
import { ClosedBy } from './type.js';

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

interface ExWritable extends Writable {
	aWrite(chunk: any, encoding?: BufferEncoding): Promise<void>;
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
	write(): Promise<ExWritable>;
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
	private closedBy = ClosedBy.Self;

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

	protected abstract _create(): Promise<void>;
	public async create() {
		if (this._opened_as_read) throw new Error('命名管道已用于写入，无法再次打开');
		if (this._opened_as_write) throw new Error('命名管道已用于读取，无法再次打开');
		if (this.disposed || this.disposing) throw new Error('命名管道已被释放，无法使用');

		if (this.closedBy === ClosedBy.NotClosed) return;
		this.closedBy = ClosedBy.NotClosed;

		this.innerLifecycle = new AsyncDisposableStack();

		this.logger.debug`创建命名管道`;
		await this._create();
	}

	get isCreated() {
		return this.closedBy === ClosedBy.NotClosed;
	}

	private _opened_as_read = false;
	protected abstract _read(): Promise<Readable>;
	public async read() {
		using _ = await this.mu.lock();

		await this.create();
		this._opened_as_read = true;
		this.logger.debug`以读取方式打开`;

		const stream = await this._read();

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

		Object.defineProperty(stream, 'aWrite', {
			value: promisify(stream.write).bind(stream),
		});

		return stream as ExWritable;
	}

	public async close() {
		if (this.closedBy !== ClosedBy.NotClosed) return false;
		using _ = await this.mu.lock();
		this.logger.debug`外部控制主动关闭`;
		await this._criticalClose(true);
		return true;
	}

	public override async dispose() {
		if (this.disposed || this.disposing) return;
		this.logger.debug`销毁管道`;

		using _ = await this.mu.lock();
		await this._criticalClose(false);
		await super.dispose();
	}

	private async _criticalClose(graceful: boolean) {
		if (this.triggerClose(ClosedBy.Self)) return;

		const stack = this.innerLifecycle;
		if (stack) {
			await stack.disposeAsync();
		}

		this.logger.debug`关闭管道: graceful=${graceful}`;
		this.closedBy = ClosedBy.Self;
	}

	protected async unlocked() {
		await this.mu.waitUnLocked();
	}

	protected triggerClose(by: ClosedBy) {
		const firstClose = !this.closedBy;
		this.closedBy |= by;
		return firstClose;
	}
}
