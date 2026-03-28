import { DuplicateDisposeAction, EnhancedAsyncDisposable, functionToDisposable, SoftwareDefectError } from '@idlebox/common';
import { EnableLogLevel, type IMyLogger } from '@idlebox/logger';
import { CollectingStream } from '@idlebox/node';
import { execaNode } from 'execa';
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
		logger: IMyLogger,
	) {
		const abortController = new AbortController();
		const process = execaNode({
			cwd: projectRoot,
			stdin: 'ignore',
			stderr: 'pipe',
			stdout: 'pipe',
			ipc: true,
			verbose: undefined,
			reject: false,
			cancelSignal: abortController.signal,
			gracefulCancel: true,
			all: true,
			encoding: 'utf8',
			env: {
				NATIVE_EXECUTER_COLLECTION: '1',
				DEBUG_LEVEL: EnableLogLevel[verboseMode ? EnableLogLevel.verbose : debugMode ? EnableLogLevel.debug : EnableLogLevel.info],
				FORCE_COLOR: colorMode ? '1' : '0',
			},
			nodeOptions: ['--experimental-transform-types', '--disable-warning=ExperimentalWarning', '--import', '@idlebox/native-executer/loader'],
		})`${executerFile} ${generaterFile}`;

		super(`process:${process.pid}`);

		const outputCollection = new CollectingStream();
		process.all.pipe(outputCollection);

		this.process = process;
		this.outputCollection = outputCollection;

		this._register(
			functionToDisposable(async function quitProcess() {
				logger.debug`killing process ${process.pid}...`;
				try {
					abortController.abort();
				} catch {}
				await process;
			}),
		);

		process.finally(() => {
			logger.debug`process ${process.pid} exited with code ${process.exitCode}`;
			this.dispose();
		});
	}

	private async send(message: IMessage) {
		await this.process.sendMessage(message as any, { strict: true });
	}

	private async recvOne<T extends IMessage['type']>(type: T): Promise<Extract<IMessage, { type: T }>> {
		try {
			const data: any = await this.process.getOneMessage({ filter: getTypeFilter(type) });
			return data;
		} catch (e) {
			if (this.process.exitCode || this.process.signalCode || !this.process.connected) await this.process;
			throw e;
		}
	}

	getOutput() {
		return this.outputCollection.getOutput();
	}

	private executing = false;
	async executeOnce() {
		if (this.executing) {
			throw new SoftwareDefectError('concurrent execution is not allowed');
		}
		this.executing = true;
		this.outputCollection.clear();
		this.send({ type: 'execute' });
		const data = await this.recvOne('execute-result');
		this.executing = false;
		return data.result;
	}

	async initialize() {
		return await this.recvOne('initialize');
	}
}

export class SpawnExecuter extends BaseExecuter {
	protected override systemWatchingFiles: string[] = [];

	private declare session: Session;

	protected override async _rebuild(): Promise<void> {
		this.logger.warn`restarting generater process...`;
		await this.session?.dispose();

		const session = new Session(this.options.projectRoot, this.sourceFile, this.logger);
		this.session = session;

		const r = await session.initialize();

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

		return await this.session.executeOnce();
	}
}
