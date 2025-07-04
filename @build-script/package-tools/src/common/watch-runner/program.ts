import { DeferredPromise, Emitter, registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { relativePath } from '@idlebox/node';
import { execa, type Options, type ResultPromise } from 'execa';
import { isApplicationShuttingDown } from '../functions/global-lifecycle.js';
import { logger } from '../functions/log.js';
import { ClearScreenHandler } from './buffer.js';

interface IWatchProgramOptions {
	readonly cwd: string;
	readonly commands: readonly string[];
	readonly nodeOptions?: readonly string[];
	readonly verbose: boolean;
	readonly keepOutput: boolean;
	readonly process: IOutputProcessor;
	readonly title: string;
}

export enum StateEvent {
	Nothing = 0,
	StartBuild = 1,
	StopSuccess = 2,
	StopFail = 3,
}

export type IOutputProcessor = (line: string) => StateEvent;

const basicOptions = {
	all: true,
	stdin: 'ignore',
	stdout: 'pipe',
	stderr: 'pipe',
	buffer: false,
	lines: true,
	encoding: 'utf8',
} satisfies Options;

const runningProcess = new Set<WatchProgramRunner>();
registerGlobalLifecycle(
	toDisposable(() => {
		logger.debug('等待%s个进程结束', runningProcess.size);
		return Promise.allSettled(
			runningProcess.values().map((e) => {
				return e.dispose();
			})
		);
	})
);

interface ICompileReport {
	output: string;
	message: string;
	success: false;
}

export class WatchProgramRunner {
	private process?: ResultPromise<typeof basicOptions>;
	private isBuilding = false;
	private readonly process_started = new DeferredPromise<void>();

	private readonly _onBuildStart = new Emitter<void>();
	public readonly onBuildStart = this._onBuildStart.register;

	private readonly _onBuildStop = new Emitter</*build success*/ boolean>();
	public readonly onBuildStop = this._onBuildStop.register;

	private readonly _onReport = new Emitter<ICompileReport>();
	public readonly onReport = this._onReport.register;

	private readonly buffer = new ClearScreenHandler();

	constructor(private readonly options: IWatchProgramOptions) {
		this.recv_line = this.recv_line.bind(this);
	}

	start() {
		if (this.process) throw new Error('Process already started');
		logger.debug('$ %s (wd: %s)', this.options.commands.join(' '), relativePath(process.cwd(), this.options.cwd));

		const p = execa(this.options.commands[0], this.options.commands.slice(1), {
			...basicOptions,
			cwd: this.options.cwd,
		});

		p.all.on('data', this.recv_line);
		if (this.options.verbose) {
			p.all.pipe(process.stderr);
		}
		p.on('error', (e) => {
			console.error('[%s] 进程无法启动:', this.options.title, e.message);
		});
		p.on('exit', (code, signal) => {
			logger.debug('[%s] 进程退出: code=%s, signal=%s', this.options.title, code, signal);
			runningProcess.delete(this);

			const isSuccess = code === 0 && !signal;
			try {
				this._onBuildStop.fireNoError(isSuccess);
				if (!isSuccess) {
					this.report(`进程非正常退出: code=${code}, signal=${signal}\n`);
				}
			} catch {}
		});
		p.on('spawn', () => {
			logger.debug('[%s] 进程开始运行: %s', this.options.title, p.pid);
		});

		this.process = p;
		this.process_started.complete();
		runningProcess.add(this);
	}

	private recv_line(buff: Buffer, encoding: BufferEncoding) {
		if (isApplicationShuttingDown) return;

		const line = buff.toString(encoding);
		this.buffer.append(line);

		const happen = this.options.process(line);
		if (happen === StateEvent.Nothing) {
			return;
		}

		if (this.isBuilding) {
			if (happen === StateEvent.StartBuild) {
				return;
			}
			if (happen === StateEvent.StopSuccess || happen === StateEvent.StopFail) {
				this.isBuilding = false;
				const succ = happen === StateEvent.StopSuccess;
				this._onBuildStop.fireNoError(succ);
				if (!succ) {
					this.report('编译失败');
				}
			} else {
				throw new Error(`$${this.options.commands.join(' ')}: 不支持的状态变化: ${happen}`);
			}
		} else {
			if (happen === StateEvent.StartBuild) {
				this.buffer.clear();

				this.isBuilding = true;
				this._onBuildStart.fireNoError();
			} else if (happen === StateEvent.StopSuccess || happen === StateEvent.StopFail) {
				return;
			} else {
				throw new Error(`$${this.options.commands.join(' ')}: 不支持的状态变化: ${happen}`);
			}
		}
	}

	async dispose() {
		this._onBuildStart.dispose();
		this._onBuildStop.dispose();
		this._onReport.dispose();

		this.process_started.cancel();
		if (!this.process) return;
		this.process.kill('SIGINT');
		await Promise.allSettled([this.process]);
	}

	async join(): Promise<any> {
		await this.process_started.p;
		await this.process;
	}

	private report(messageTitle: string) {
		this._onReport.fireNoError({ message: messageTitle, output: this.buffer.flush(), success: false });
	}
}
