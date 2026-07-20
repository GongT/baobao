import { DuplicateDisposeAction, EnhancedAsyncDisposable, functionToDisposable, raceTimeout, SoftwareDefectError } from '@idlebox/common';
import { EnableLogLevel, type IMyLogger } from '@idlebox/logger';
import { CollectingStream } from '@idlebox/node';
import { ExecaError, execaNode } from 'execa';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';
import { BaseExecuter } from './executer.base.js';
import { colorMode, debugMode, verboseMode } from './shared.js';
import { getTypeFilter, type IGenerateResult, type IMessage } from './spawn/messages.js';

const executerFile = fileURLToPath(import.meta.resolve('./spawn/spawn.main.js'));

class Session extends EnhancedAsyncDisposable {
	private readonly process;
	private outputCollection;

	protected override duplicateDispose = DuplicateDisposeAction.Allow;

	constructor(
		projectRoot: string,
		public readonly generaterFile: string,
		private readonly logger: IMyLogger,
	) {
		const abortController = new AbortController();
		const options = ['--enable-source-maps', '--import', import.meta.resolve('@idlebox/native-executer/register')];
		const process = execaNode({
			cwd: projectRoot,
			stdin: 'ignore',
			stderr: 'pipe',
			stdout: 'pipe',
			all: true,
			ipc: true,
			// verbose: 'full',
			verbose: verboseMode ? 'short' : undefined,
			reject: false,
			cancelSignal: abortController.signal,
			gracefulCancel: true,
			encoding: 'utf8',
			env: {
				NATIVE_EXECUTER_COLLECTION: '1',
				DEBUG_LEVEL: EnableLogLevel[verboseMode ? EnableLogLevel.verbose : debugMode ? EnableLogLevel.debug : EnableLogLevel.info],
				FORCE_COLOR: colorMode ? '1' : '0',
			},
			nodeOptions: options,
		})`${executerFile} ${generaterFile}`;

		super(`process:${process.pid}`);

		const outputCollection = new CollectingStream();
		process.all.pipe(outputCollection);

		this.process = process;
		this.outputCollection = outputCollection;

		this._register(
			functionToDisposable(async function quitProcess() {
				logger.debug`当前进程 pid=${process.pid}`;
				try {
					abortController.abort();
				} catch {}
				await process;
			}),
		);

		process.finally(() => {
			logger.debug`进程 ${process.pid} 以 ${process.exitCode} 退出`;
			this.dispose();
		});
	}

	private async send(message: IMessage) {
		if (this.disposing || this.disposed) return;

		await this.process.sendMessage(message as any, { strict: true });
	}

	private async recvOne<T extends IMessage['type']>(type: T): Promise<Extract<IMessage, { type: T }>> {
		try {
			const data: any = await this.process.getOneMessage({ filter: getTypeFilter(type) });
			return data;
		} catch (e: any) {
			if (this.process.exitCode || this.process.signalCode || !this.process.connected) {
				let msg = '';
				msg += `工作进程 ${this.process.pid} 意外退出: ${this.process.exitCode}, 信号: ${this.process.signalCode}, IPC连接: ${this.process.connected}\n`;
				let e: ExecaError;
				try {
					e = (await this.process) as any;
				} catch (ee: any) {
					e = ee;
				}
				msg += '输出内容:\x1B[2m\n';
				if (e.all) {
					msg += (e.all ?? e.stderr ?? e.stdout ?? e.shortMessage ?? 'no message').toString().trimEnd();
				}
				msg += '\x1B[0m';
				const newError = new Error(msg);
				newError.stack = e.stack;
				throw newError;
			} else {
				const heading = `工作进程 ${this.process.pid} IPC通信失败: `;
				e.message = heading + e.message;
				e.stack = heading + e.stack;
				throw e;
			}
		}
	}

	getOutput() {
		return this.outputCollection.getOutput();
	}

	private executing?: Error;
	async executeOnce() {
		if (this.executing) {
			throw new SoftwareDefectError('codgen: 上次执行还未完成，不能重复执行', { cause: this.executing });
		}
		this.executing = new Error('上次执行:');
		try {
			this.outputCollection.clear();
			this.send({ type: 'execute' });
			const data = await this.recvOne('execute-result');
			return data.result;
		} finally {
			this.executing = undefined;
		}
	}

	async initialize() {
		try {
			return await raceTimeout(5000, this.recvOne('initialize'));
		} catch (e) {
			this.logger.error`生成器进程 ${this.process.pid} 握手失败`;
			throw e;
		}
	}
}

export class SpawnExecuter extends BaseExecuter {
	protected override systemWatchingFiles: string[] = [];

	private declare session: Session;

	protected override async _rebuild(): Promise<void> {
		if (this.session) {
			this.logger.warn`(重启) 停止现有生成器进程...`;
			await this.session.dispose();
		}

		this.logger.info`启动生成器进程`;

		const session = new Session(this.options.projectRoot, this.sourceFile, this.logger);
		this.session = session;

		const r = await session.initialize();

		this.logger.info`  - 生成器进程已启动`;

		this.systemWatchingFiles = r.files;

		if (r.error) {
			const e = new Error(r.error.message);
			e.stack = r.error.stack;
			throw e;
		}
	}

	protected override async _execute(): Promise<IGenerateResult> {
		if (!this.session) {
			await this._rebuild();
		}

		return await this.session.executeOnce().catch((e) => {
			if (e instanceof ExecaError) {
				if (e.message.includes('Command was gracefully canceled with exit code 0')) {
					this.logger.error`关注此错误: long<${e.stack}>`;
					assert.ok(this.result);
					return this.result;
				}
			}
			throw e;
		});
	}
}
