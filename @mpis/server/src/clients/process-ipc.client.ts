import { ChildProcessExitError, humanDate, isLinux, isWindows, lcfirst, PathArray, timeout, TimeoutError } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntilSync, getEnvironment, streamPromise } from '@idlebox/node';
import { BuildEvent, is_message } from '@mpis/shared';
import type { Options, ResultPromise } from 'execa';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { Writable } from 'node:stream';
import type { InspectContext } from 'node:util';
import { split as splitCmd } from 'split-cmd';
import { ProtocolClientObject } from '../common/protocol-client-object.js';

const vscodeDebugRegex = /\s*--require.+bootloader\.js\s*/;

type fixedOptions = {
	cwd: string;
	stdin: 'ignore';
	stdout: 'pipe';
	stderr: 'pipe';
	env: Record<string, string>;
	reject: false;
	ipc: true;
	buffer: false;
	killDescendants: boolean;
};
type disallowedKeys = keyof fixedOptions | 'stdio';
type MyOptions = Omit<Options, disallowedKeys> & fixedOptions;

class OutputHandler extends Writable {
	private _output = '';
	private _last_output = '';

	constructor(private readonly logger: IMyLogger) {
		super({ defaultEncoding: 'utf-8' });
	}

	override _write(chunk: Buffer | string, _encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
		this._output += chunk.toString('utf-8');
		callback();
	}

	clear() {
		this.logger.verbose`clear output buffer.`;
		this._last_output = this._output;
		this._output = '';
	}

	/**
	 * 这个输出只用于异常时显示，普通编译错误在onFailure中处理
	 */
	override toString() {
		return this._output || this._last_output;
	}

	/**
	 * 记录clear之前的输出，唯一用途是watch下成功后异常退出时能看到过程
	 */
	getLastOutput() {
		return this._last_output;
	}
}

interface IProcessState {
	started: boolean;
	failedExecute: boolean;
	pid?: number;
	exitCode?: number;
	signal?: NodeJS.Signals;
}

/**
 * 创建一个node进程，它会发送事件过来
 */
export class ProcessIPCClient extends ProtocolClientObject {
	private declare process: ResultPromise<MyOptions>;
	public stopSignal: NodeJS.Signals = 'SIGINT';
	private readonly p_status: IProcessState = { started: false, failedExecute: false };
	public readonly outputStream;
	public readonly pathvar;
	public readonly commandline: readonly string[];
	private _displayTitle: string;

	constructor(
		id: string,
		commandline: readonly string[] | string,
		public readonly cwd: string,
		public readonly env: Record<string, string>,
		logger?: IMyLogger,
	) {
		super(id, logger);
		this._displayTitle = id;

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
				throw new Error('环境变量中没有PATH');
			}
			this.pathvar = new PathArray(pathVar);
			this.pathvar.add(dirname(process.execPath), true, true);
			const nmPath = findUpUntilSync({ from: cwd, file: 'node_modules' });
			if (nmPath) {
				this.pathvar.add(resolve(nmPath, '.bin'), true, true);
			} else {
				this.logger.warn`运行目录long<${cwd}>附近找不到node_modules`;
			}
		}

		if (this.logger.colorEnabled) {
			env.FORCE_COLOR = 'yes';
		}

		this.outputStream = new OutputHandler(this.logger);
	}

	/**
	 * 当前IPC所代表的进程的状态
	 */
	get targetState(): Readonly<IProcessState> {
		return this.p_status;
	}

	set displayTitle(title: string) {
		this._displayTitle = title;
	}
	get displayTitle() {
		return this._displayTitle;
	}

	static is(obj: any): obj is ProcessIPCClient {
		return obj instanceof ProcessIPCClient;
	}

	private async handleMessages(sub_process: ResultPromise<MyOptions>) {
		try {
			const itr = sub_process.getEachMessage({ reference: false });
			for await (const message of itr) {
				this.onMessage(message);
			}
		} catch (e) {
			this.logger.error`处理IPC消息错误: ${(e as any)?.message || '*no message*'}`;
		}
	}

	private onMessage(message: any) {
		if (message.event === BuildEvent.Start) {
			this.logger.log`Server: receive: \x1B[1;38;5;14m${message.event}\x1B[39m message=[${message.message}] output=${message.output}`;
		} else if (message.event === BuildEvent.Success) {
			this.logger.success`Server: receive: \x1B[1;38;5;14m${message.event}\x1B[39m message=[${message.message}] output=${message.output}`;
		} else if (message.event === BuildEvent.Failed) {
			this.logger.warn`Server: receive: \x1B[1;38;5;9m${message.event}\x1B[39m message=[${message.message}] output=${message.output}`;
		}
		this.logger.verbose`${message}`;

		if (this.logger.verbose.isEnabled && message.output) {
			this.logger.verbose(message.output);
		}

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
		if (this.p_status.started) throw new Error('process already spawned');

		const env = {
			NODE_OPTIONS: process.env.NODE_OPTIONS || '',
			...this.env,
			PATH: this.pathvar.toString(),
			BUILD_PROTOCOL_SERVER: 'ipc:nodejs',
			BUILD_PROTOCOL_TITLE: this._displayTitle,
		};

		for (const item of process.execArgv) {
			if (env.NODE_OPTIONS.includes(item)) continue;

			env.NODE_OPTIONS += ` ${item}`;
		}

		env.NODE_OPTIONS = env.NODE_OPTIONS.replace(vscodeDebugRegex, ' ');

		this.logger.log`[exec] spawning | commandline<${this.commandline}>`;
		this.logger.debug`[exec] working directory: long<${this.cwd}>`;
		this.logger.verbose`[exec] path variable: long<${this.pathvar.toString()}>`;
		this.logger.verbose`[exec] environment variable: ${this.env}`;
		this.logger.verbose`[exec] NODE_OPTIONS: ${env.NODE_OPTIONS}`;

		let killDescendants;
		if (process.pid === 1 || !isLinux || process.env.CI || process.env.MPIS_SERVER_SKIP_GROUP) {
			this.logger.debug`[exec] 不使用进程组，因为pid=1或非linux或CI环境或MPIS_SERVER_SKIP_GROUP`;
			killDescendants = false;
		} else {
			this.logger.debug`[exec] 使用进程组，因为pid!=1且linux且非CI环境且MPIS_SERVER_SKIP_GROUP未设置`;
			process.env.MPIS_SERVER_SKIP_GROUP = 'yes';
			killDescendants = true;
		}

		const doExec = execa<MyOptions>({
			cwd: this.cwd,
			stdin: 'ignore',
			stdout: 'pipe',
			stderr: 'pipe',
			ipc: true,
			env: env,
			reject: false,
			buffer: false,
			detached: process.pid === 1,
			killDescendants: killDescendants,
		});

		const sub_process = doExec`${this.commandline}`;

		this.process = sub_process;
		this.p_status.pid = sub_process.pid;
		this.p_status.started = true;

		if (this.logger.verbose.isEnabled) {
			for (const stream of ['stdout', 'stderr'] as const) {
				const logger = this.logger.extend(stream[3]);
				sub_process[stream].on('data', (chunk: Buffer) => {
					if (logger.verbose.isEnabled) {
						const debugTxt = chunk.toString('utf-8').trimEnd().replaceAll('\n', '\\n').replaceAll('\r', '\\r').replaceAll('\x1B', '\\e');

						logger.verbose`[exec] <${stream}> ${debugTxt}`;
					}
					this.outputStream.write(chunk);
				});
			}
		} else {
			sub_process.stdout.pipe(this.outputStream, { end: false });
			sub_process.stderr.pipe(this.outputStream, { end: false });
		}

		this.handleMessages(sub_process);

		try {
			await Promise.all([streamPromise(sub_process.stdout), streamPromise(sub_process.stderr)]);
			const process = await sub_process;
			this.p_status.started = false;

			if (this.disposed) {
				this.logger.debug`[exec] (after dispose) ${ChildProcessExitError.status(process)}`;
				return;
			}

			this.p_status.exitCode = process.exitCode;
			this.p_status.signal = process.signal;

			if (this.isFail) {
				this.logger.verbose`[exec] 进程退出，已处于错误状态，无需重复通知`;
			} else {
				if (process.exitCode || process.signal) {
					const output = this.outputStream.toString();
					this.logger.debug`[exec] 进程退出: exitCode=${process.exitCode}, signal=${process.signal}`;
					this.logger.verbose`[exec] ${process}`;

					const m = ChildProcessExitError.status(process);
					return this.emitFailure(m, output);
				}

				if (process.failed) {
					// 由于reject=false，只有spawn失败才会到这里
					this.p_status.failedExecute = true;
					this.logger.warn`[exec] process can not start: ${process.message}`;
					this.logger.verbose`${process}`;
					return this.emitFailure(`进程"${this._id}"无法启动: ${lcfirst(process.message || '*no message*')}`, this.outputStream.toString());
				}
			}

			this.logger.debug('[exec] %s', ChildProcessExitError.status(process));
		} catch (e) {
			// 和进程无关的错误
			this.p_status.failedExecute = true;
			this.p_status.started = false;
			return this.emitFailure(`[exec] 进程"${this._id}"运行出错: ${(e as any)?.message || '*no message*'}`, this.outputStream.toString());
		}
	}

	protected override async _stop() {
		if (!this.process || !this.p_status.started) {
			return;
		}

		this.logger.debug`sending ${this.stopSignal} to ${this._id}`;

		// 发送信号然后等待最多5秒
		const process = this.process;

		process.kill(this.stopSignal);

		try {
			await Promise.race([process, timeout(5000, `process ${process.pid} did not exit`)]);
		} catch (e: any) {
			if (TimeoutError.is(e)) {
				this.logger.error`force killing process: ${e.message}`;
				process.kill('SIGKILL');
				return;
			}
			throw e;
		}
	}

	// override _inspect(_d: number, options: InspectContext) {
	// 	return `${id} { ${options.stylize(this.last_event_message, 'string')} }`;
	// }

	override _inspectDesc(options: InspectContext) {
		if (this.process?.pid) {
			const stillRunning = this.process.nodeChildProcess.exitCode === null;
			const pidStyle = stillRunning ? 'number' : 'undefined';
			const pid = `[pid=${options.stylize(this.process.pid.toString(), pidStyle)}]`;
			let time = '';
			if (!stillRunning && this.timings.executeStart) {
				if (this.timings.executeEnd) {
					time = ` [${humanDate.delta(this.timings.executeEnd - this.timings.executeStart)}]`;
				} else {
					time = ` [~${humanDate.delta(Date.now() - this.timings.executeStart)}]`;
				}
			}
			return `${this._id} ${pid}${time}`;
		} else {
			const ns = options.stylize('not started', 'undefined');
			return `${this._id} ${ns}`;
		}
	}

	// TODO: 恢复运行的逻辑有问题，需要排查
	// private _is_paused = false;
	// readonly [pause]: IPauseControl = {
	// 	// implements IPauseableObject
	// 	isPaused: () => {
	// 		return this._is_paused;
	// 	},
	// 	pause: async () => {
	// 		if (this._is_paused) return;
	// 		this.logger.verbose`send SIGSTOP to ${this.process.pid}`;
	// 		this.process.kill('SIGSTOP');
	// 		this._is_paused = true;
	// 	},
	// 	resume: async () => {
	// 		if (!this._is_paused) return;
	// 		this.logger.verbose`send SIGCONT to ${this.process.pid}`;
	// 		this.process.kill('SIGCONT');
	// 		this._is_paused = false;
	// 	},
	// };
}
