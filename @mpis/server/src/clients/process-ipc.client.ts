import { isWindows, lcfirst, PathArray, timeout, TimeoutError } from '@idlebox/common';
import { pause, type IPauseControl } from '@idlebox/dependency-graph';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntilSync, getEnvironment, streamPromise } from '@idlebox/node';
import { BuildEvent, is_message } from '@mpis/shared';
import type { Options, ResultPromise } from 'execa';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { Writable } from 'node:stream';
import type { InspectOptionsStylized } from 'node:util';
import { split as splitCmd } from 'split-cmd';
import { ProtocolClientObject } from '../common/protocol-client-object.js';

interface MyOptions extends Options {
	cwd: string;
	stdio: ['ignore', 'pipe', 'pipe', 'ipc'];
	env: Record<string, string>;
	reject: false;
	ipc: true;
	buffer: false;
}

class OutputHandler extends Writable {
	private _output = '';

	constructor() {
		super({ defaultEncoding: 'utf-8' });
	}

	override _write(chunk: Buffer | string, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		this._output += chunk.toString('utf-8');
		callback();
	}

	clear() {
		this._output = '';
	}

	/**
	 * 这个输出只用于异常时显示，普通编译错误在onFailure中处理
	 */
	override toString() {
		return this._output.toString();
	}
}

/**
 * 创建一个node进程，它会发送事件过来
 */
export class ProcessIPCClient extends ProtocolClientObject {
	private declare process: ResultPromise<MyOptions>;
	public stopSignal: NodeJS.Signals = 'SIGINT';
	private _started = false;
	public readonly outputStream = new OutputHandler();
	public readonly pathvar;
	public readonly commandline: readonly string[];
	public displayTitle: string;

	constructor(
		id: string,
		commandline: readonly string[] | string,
		public readonly cwd: string,
		public readonly env: Record<string, string>,
		logger?: IMyLogger,
	) {
		super(id, logger);
		this.displayTitle = id;

		if (typeof commandline === 'string') {
			this.commandline = splitCmd(commandline);
		} else {
			this.commandline = commandline;
		}

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
				this.outputStream.clear();
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
			stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
			ipc: true,
			env: env,
			reject: false,
			buffer: false,
			maxBuffer: 10,
			detached: process.pid === 1,
		} satisfies MyOptions);
		const [command, ...args] = this.commandline;
		const sub_process = doExec(command, args);
		this.process = sub_process;

		if (this.logger.verbose.isEnabled) {
			for (const stream of ['stdout', 'stderr'] as const) {
				const logger = this.logger.extend(stream[3]);
				sub_process[stream].on('data', (chunk: Buffer) => {
					if (logger.verbose.isEnabled) {
						const debugTxt = chunk.toString('utf-8').trimEnd().replaceAll('\n', '\\n').replaceAll('\r', '\\r').replaceAll('\x1B', '\\e');

						logger.verbose`${debugTxt}`;
					}
					this.outputStream.write(chunk);
				});
			}
		} else {
			sub_process.stdout.pipe(this.outputStream, { end: false });
			sub_process.stderr.pipe(this.outputStream, { end: false });
		}

		sub_process.on('message', this.onMessage);

		this._started = true;
		try {
			await Promise.all([streamPromise(sub_process.stdout), streamPromise(sub_process.stderr)]);
			const process = await sub_process;

			if (this.hasDisposed) {
				this.logger.debug`(after dispose) process quit with code ${process.exitCode}`;
				return;
			}

			if (process.exitCode || process.signal) {
				const output = this.outputStream.toString();
				this.logger.debug`process exit, exitCode: ${process.exitCode}, signal: ${process.signal}`;
				this.logger.verbose`${process}`;

				const m = process.exitCode ? `process "${this._id}" quited with code ${process.exitCode}` : `process "${this._id}" killed by signal ${process.signal}`;
				return this.emitFailure(m, output);
			}

			if (process.failed) {
				this.logger.warn`process can not start: ${process.message}`;
				this.logger.verbose`${process}`;
				return this.emitFailure(`process "${this._id}" can not start: ${lcfirst(process.message || '*no message*')}`, this.outputStream.toString());
			}

			this.logger.debug`process quited with code ${process.exitCode}`;
		} finally {
			this._started = false;
		}
	}

	protected override async _stop() {
		if (!this.process || !this._started) {
			return;
		}

		this.logger.debug`sending ${this.stopSignal} to ${this._id}`;

		// 发送信号然后等待最多5秒
		const process = this.process;

		process.kill(this.stopSignal);

		try {
			await Promise.race([process, timeout(5000, 'process did not exit')]);
		} catch (e: any) {
			if (TimeoutError.is(e)) {
				this.logger.error`force killing process: ${e.message}`;
				process.kill('SIGKILL');
				return;
			}
			throw e;
		}
	}

	// override _inspect(_d: number, options: InspectOptionsStylized) {
	// 	return `${id} { ${options.stylize(this.last_event_message, 'string')} }`;
	// }

	override _inspectDesc(options: InspectOptionsStylized) {
		const pid = this.process?.pid ? `[pid=${options.stylize(this.process.pid.toString(), 'number')}]` : options.stylize('not started', 'undefined');
		return `${this._id} ${pid}`;
	}

	private _is_paused = false;
	readonly [pause]: IPauseControl = {
		// implements IPauseableObject
		isPaused: () => {
			return this._is_paused;
		},
		pause: async () => {
			if (this._is_paused) return;
			this.logger.verbose`send SIGSTOP to ${this.process.pid}`;
			this.process.kill('SIGSTOP');
			this._is_paused = true;
		},
		resume: async () => {
			if (!this._is_paused) return;
			this.logger.verbose`send SIGCONT to ${this.process.pid}`;
			this.process.kill('SIGCONT');
			this._is_paused = false;
		},
	};
}
