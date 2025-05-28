import type { ILogger } from './output.js';
import { ExecuteReason, type ILogMessage } from './shared.js';

export interface IGenerateResult {
	outputs: ILogMessage[];
	userWatchFiles: ReadonlySet<string>;
	success: boolean;
	changes: number;
	totalFiles: number;
	error?: Error;
}

export abstract class BaseExecuter {
	protected result?: IGenerateResult;

	constructor(
		protected readonly projectRoot: string,
		protected readonly sourceFileAbs: string, // xxx.generator.ts
		protected readonly logger: ILogger
	) {}

	get hasMemoResult() {
		return !!this.result;
	}

	protected errorResult(err: Error): IGenerateResult {
		return {
			changes: 0,
			totalFiles: 0,
			success: false,
			outputs: [
				{
					type: 'error',
					message: err.message,
				},
			],
			error: err,
			userWatchFiles: new Set(),
		};
	}

	protected abstract _execute(scriptFile: string): Promise<IGenerateResult>;

	async execute(scriptFile: string) {
		this.result = undefined;
		try {
			this.result = await this._execute(scriptFile);
		} catch (e: any) {
			this.logger.warn(`_execute() should not throw: ${e.message}`);
			this.result = {
				outputs: [e.message],
				userWatchFiles: new Set(),
				success: false,
				changes: 0,
				totalFiles: 0,
				error: e,
			};
			throw e;
		}

		const result = this.result;

		for (const data of result.outputs) {
			this.logger[data.type](data.message);
		}
		if (result.success) {
			this.logger.success('generate success');
		} else {
			this.logger.error('generate failed');
			throw result.error; // catch by pool
		}

		return this.result;
	}

	shouldExecute(trigger: ReadonlySet<string>): ExecuteReason {
		if (!this.result) {
			this.logger.debug('should run because never executed');
			return ExecuteReason.NeedExecute;
		}
		if (!this.result.success) {
			this.logger.debug('should run because last run has failed');
			return ExecuteReason.NeedExecute;
		}
		for (const watch of this.result.userWatchFiles) {
			if (trigger.has(watch)) {
				this.logger.debug(`should run because user watching file has changed: ${watch}`);
				return ExecuteReason.NeedExecute;
			}
			if (watch.endsWith('/')) {
				for (const file of trigger) {
					if (file.startsWith(watch)) {
						this.logger.debug(`should run because user watching folder has changed: ${file}`);
						return ExecuteReason.NeedCompile;
					}
				}
			}
		}
		this.logger.debug('should not run');
		return ExecuteReason.NoNeed;
	}
}
