import { timeout } from '@idlebox/common';
import { BuildEvent, is_message } from '@mpis/shared';
import type { Options, ResultPromise } from 'execa';
import { execa } from 'execa';
import { Writable } from 'node:stream';
import { CompileError } from '../common/error.js';
import { ProtocolClientObject, State } from '../common/protocol-client-object.js';

interface MyOptions extends Options {
	cwd: string;
	stdio: ['inherit', 'pipe', 'pipe', 'ipc'];
	env: Record<string, string>;
	reject: false;
	ipc: true;
	buffer: false;
}

class OutputHandler extends Writable {
	private _output: Buffer = Buffer.allocUnsafe(0);

	override _write(chunk: Buffer, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		this._output = Buffer.concat([this._output, chunk]);
		callback();
	}

	clear() {
		this._output = Buffer.allocUnsafe(0);
	}

	/**
	 * 这个输出只用于异常时显示，普通编译错误在onFailure中处理
	 */
	override toString() {
		return this._output.toString('utf-8');
	}
}

export class ProcessIPCClient extends ProtocolClientObject {
	private declare process: ResultPromise<MyOptions>;
	public stopSignal: NodeJS.Signals = 'SIGINT';
	private _started = false;
	public readonly outputStream = new OutputHandler();

	constructor(
		title: string,
		public readonly commandline: readonly string[] | string,
		public readonly cwd: string,
		public readonly env: Record<string, string>,
	) {
		super(title);
	}

	static is(obj: any): obj is ProcessIPCClient {
		return obj instanceof ProcessIPCClient;
	}

	private onMessage(message: any) {
		if (!is_message(message)) return;

		this.logger.verbose`receive event: ${message.event}`;
		switch (message.event) {
			case BuildEvent.Start:
				this.outputStream.clear();
				this.emitStart();
				break;
			case BuildEvent.Success:
				this.emitSuccess();
				break;
			case BuildEvent.Failed:
				this.emitFailure(new CompileError(this.title, `${message.output}`));
				break;
			default:
				this.logger.warn`unknown message event: ${message.event}`;
		}
	}

	protected override async _execute() {
		if (this._started) throw new Error('process already spawned');

		this.logger.info('spawning | %s', this.commandline);

		const doExec = execa({
			cwd: this.cwd,
			stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
			ipc: true,
			env: {
				...this.env,
				BUILD_PROTOCOL_SERVER: 'ipc:nodejs',
				BUILD_PROTOCOL_TITLE: this.title,
			},
			reject: false,
			buffer: false,
			maxBuffer: 10,
		} satisfies MyOptions);
		if (typeof this.commandline === 'string') {
			this.process = doExec({ shell: true })(this.commandline);
		} else {
			const [command, ...args] = this.commandline;
			this.process = doExec(command, args);
		}

		if (this.logger.verbose.isEnabled) {
			for (const stream of ['stdout', 'stderr'] as const) {
				this.process[stream]!.on('data', (chunk: Buffer) => {
					const debugTxt = chunk
						.toString('utf-8')
						.replaceAll('\n', '\\n')
						.replaceAll('\r', '\\r')
						.replaceAll('\x1B', '\\e');

					this.logger.verbose`[${stream}] ${debugTxt}`;
					this.outputStream.write(chunk);
				});
			}
		} else {
			this.process.stdout!.pipe(this.outputStream);
			this.process.stderr!.pipe(this.outputStream);
		}

		this.process.on('message', this.onMessage);

		this._started = true;
		try {
			const process = await this.process;

			if (this.hasDisposed) {
				this.logger.warn`(after dispose) process quit with code ${process.exitCode}`;
				return;
			}

			if (process.failed) {
				this.logger.warn`process can not start: ${process.message}`;
				throw new Error(`process can not start: ${process.message}`);
			}

			if (process.exitCode !== 0) {
				this.logger.warn`process died with code ${process.signal ?? process.exitCode}`;
				throw new Error(`process exited with code ${process.signal ?? process.exitCode}`);
			}

			this.logger.warn`process quited with code ${process.exitCode}`;
		} finally {
			this._started = false;
		}
	}

	override async dispose() {
		await super.dispose();

		if (!this.process || !this._started) return;

		this.logger.debug`sending ${this.stopSignal} to ${this.title}`;

		// 发送信号然后等待最多5秒
		const process = this.process;

		process.kill(this.stopSignal);

		await Promise.race([process, timeout(5000, 'process did not exit in 5s')]);
	}

	protected override _inspect() {
		return `[Process ${this.process?.pid ?? 'not started'} ${State[this.state]}]`;
	}
}
