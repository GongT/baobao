import { isWindows, lcfirst, PathArray, timeout } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntilSync, getEnvironment, streamPromise } from '@idlebox/node';
import { BuildEvent, is_message } from '@mpis/shared';
import type { Options, ResultPromise } from 'execa';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { Writable } from 'node:stream';
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
	public readonly pathvar;
	public displayTitle: string;

	constructor(
		id: string,
		public readonly commandline: readonly string[] | string,
		public readonly cwd: string,
		public readonly env: Record<string, string>,
		logger?: IMyLogger,
	) {
		super(id, logger);
		this.displayTitle = id;

		const pathVarName = isWindows ? 'Path' : 'PATH';
		if (env[pathVarName]) {
			this.pathvar = new PathArray(env[pathVarName]);
			delete env[pathVarName];
		} else {
			// TODO: rig package
			const pathVar = getEnvironment(pathVarName).value;
			if (!pathVar) {
				throw new Error('PATH environment variable is not set');
			}
			this.pathvar = new PathArray(pathVar);
			this.pathvar.add(dirname(process.execPath), true, true);
			const nmPath = findUpUntilSync({ from: cwd, file: 'node_modules' });
			if (nmPath) {
				this.pathvar.add(resolve(nmPath, '.bin'), true, true);
			} else {
				this.logger.warn`running command without any package.`;
			}
		}

		if (this.logger.colorEnabled) {
			env.FORCE_COLOR = 'yes';
		}

		this.onMessage = this.onMessage.bind(this);
	}

	static is(obj: any): obj is ProcessIPCClient {
		return obj instanceof ProcessIPCClient;
	}

	private onMessage(message: any) {
		this.logger.debug`receive event: ${message?.event}`;
		this.logger.verbose`${message}`;

		if (!is_message(message)) {
			this.logger.verbose`unknown event.`;
			return;
		}

		switch (message.event) {
			case BuildEvent.Start:
				this.outputStream.clear();
				this.emitStart();
				break;
			case BuildEvent.Success:
				this.emitSuccess(message.message, message.output);
				break;
			case BuildEvent.Failed:
				this.emitFailure(message.message, message.output);
				break;
			default:
				this.logger.warn`unknown message event: ${message.event}`;
		}
	}

	protected override async _execute() {
		if (this._started) throw new Error('process already spawned');

		const env = {
			...this.env,
			PATH: this.pathvar.toString(),
			BUILD_PROTOCOL_SERVER: 'ipc:nodejs',
			BUILD_PROTOCOL_TITLE: this.displayTitle,
		};

		this.logger.log`spawning | commandline<${this.commandline}>`;
		this.logger.debug`working directory: long<${this.cwd}>`;
		this.logger.debug`path variable: long<${this.pathvar.toString()}>`;
		this.logger.debug`environment variable: ${this.env}`;

		const doExec = execa({
			cwd: this.cwd,
			stdio: ['inherit', 'pipe', 'pipe', 'ipc'],
			ipc: true,
			env: env,
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
				const logger = this.logger.extend(stream[3]);
				this.process[stream]!.on('data', (chunk: Buffer) => {
					if (logger.verbose.isEnabled) {
						const debugTxt = chunk
							.toString('utf-8')
							.trimEnd()
							.replaceAll('\n', '\\n')
							.replaceAll('\r', '\\r')
							.replaceAll('\x1B', '\\e');

						logger.verbose`${debugTxt}`;
					}
					this.outputStream.write(chunk);
				});
			}
		} else {
			this.process.stdout!.pipe(this.outputStream, { end: false });
			this.process.stderr!.pipe(this.outputStream, { end: false });
		}

		this.process.on('message', this.onMessage);

		this._started = true;
		try {
			await Promise.all([streamPromise(this.process.stdout!), streamPromise(this.process.stderr!)]);
			const process = await this.process;

			if (this.hasDisposed) {
				this.logger.warn`(after dispose) process quit with code ${process.exitCode}`;
				return;
			}

			if (process.exitCode || process.signal) {
				const output = this.outputStream.toString();
				this.logger.debug`process exit, exitCode: ${process.exitCode}, signal: ${process.signal}`;
				this.logger.verbose`${process}`;

				let m = process.exitCode
					? `process quited with code ${process.exitCode}`
					: `process killed by signal ${process.signal}`;
				return this.emitFailure(m, output);
			}

			if (process.failed) {
				this.logger.warn`process can not start: ${process.message}`;
				this.logger.verbose`${process}`;
				return this.emitFailure(
					`process can not start: ${lcfirst(process.message || '*no message*')}`,
					this.outputStream.toString(),
				);
			}

			this.logger.debug`process quited with code ${process.exitCode}`;
		} finally {
			this._started = false;
		}
	}

	override async dispose() {
		await super.dispose();

		if (!this.process || !this._started) return;

		this.logger.debug`sending ${this.stopSignal} to ${this._id}`;

		// 发送信号然后等待最多5秒
		const process = this.process;

		process.kill(this.stopSignal);

		await Promise.race([process, timeout(5000, 'process did not exit in 5s')]);
	}

	override _inspect() {
		return `[Process ${this.process?.pid ?? 'not started'} ${State[this.state]}]`;
	}
}
