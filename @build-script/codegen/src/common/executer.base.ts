import { convertCaughtError, EnhancedDisposable, raceTimeout, TimeoutError } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { ExecuteReason } from './shared.js';
import type { IGenerateResult } from './spawn/messages.js';

interface IOptions {
	readonly projectRoot: string;
}

export abstract class BaseExecuter extends EnhancedDisposable {
	protected result?: IGenerateResult;
	protected abstract systemWatchingFiles: readonly string[];

	constructor(
		public readonly sourceFile: string, // /full/path/to/xxx.generator.ts
		protected readonly options: IOptions,
		public readonly logger: IMyLogger,
	) {
		super(logger.tag);
	}

	get hasMemoResult() {
		return !!this.result;
	}
	protected abstract _rebuild(force: boolean): Promise<void>;
	protected abstract _execute(): Promise<IGenerateResult>;

	private built = false;
	async build() {
		this.logger.debug`need build`;

		Object.assign(globalThis, { logger: this.logger });

		await raceTimeout(1500, this._rebuild(!this.built));

		this.built = true;

		Object.assign(globalThis, { logger: undefined });

		this.logger.debug`build finished, watch ${this.systemWatchingFiles.length} files`;
	}

	async execute() {
		this.result = undefined;

		if (!this.built) {
			this.logger.debug`execute without build, force build first`;
			await this.build();
		}

		try {
			this.result = await raceTimeout(1500, this._execute());
		} catch (ee: any) {
			const e = convertCaughtError(ee);
			this.result = {
				outputs: `${e.message}\n${e.stack || '<no stack trace available>'}`,
				userWatchFiles: [],
				success: false,
				changes: 0,
				totalFiles: 0,
				error: e,
			};
			if (e instanceof TimeoutError) {
			} else {
				this.logger.warn(`_execute should not throw: ${e.stack || e.message}`);
				throw e;
			}
		}

		if (this.result.success) {
			this.logger.success('generate success');
		} else {
			this.logger.error('generate failed');
			throw this.result.error; // catch by pool
		}

		return this.result;
	}

	watchingFiles(sourceOnly: boolean) {
		// packageJsonPath
		if (this.result && !sourceOnly) {
			return this.systemWatchingFiles.concat([...this.result.userWatchFiles.values()]);
		}
		return this.systemWatchingFiles;
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
		for (const watch of this.systemWatchingFiles) {
			if (trigger.has(watch)) {
				this.logger.debug(`should rebuild because source has changed: ${watch}`);
				return ExecuteReason.NeedCompile;
			}
		}
		this.logger.debug('should not run');
		return ExecuteReason.NoNeed;
	}
}
