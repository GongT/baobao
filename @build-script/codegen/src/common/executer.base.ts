import { convertCaughtError, EnhancedDisposable, prettyPrintError, raceTimeout, TimeoutError } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { ExecuteReason, makeQueuedLatest } from './shared.js';
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

		this.execute = makeQueuedLatest(this.execute.bind(this));
	}

	get hasMemoResult() {
		return !!this.result;
	}
	protected abstract _rebuild(force: boolean): Promise<void>;
	protected abstract _execute(): Promise<IGenerateResult>;

	private built = false;
	async build() {
		this.logger.debug`生成器需要重新编译`;

		Object.assign(globalThis, { logger: this.logger });

		await raceTimeout(10000, this._rebuild(!this.built));

		this.built = true;

		Object.assign(globalThis, { logger: undefined });

		this.logger.debug`编译完成, 监听 ${this.systemWatchingFiles.length} 个文件`;
	}

	async execute() {
		this.result = undefined;

		if (!this.built) {
			await this.build();
		}

		try {
			this.result = await raceTimeout(30000, this._execute());
		} catch (ee: any) {
			const e = convertCaughtError(ee);
			this.result = {
				outputs: `${e.message}\n${e.stack || '<缺少栈信息>'}`,
				userWatchFiles: [],
				success: false,
				changes: 0,
				totalFiles: 0,
				error: e,
			};
			if (e instanceof TimeoutError) {
			} else {
				prettyPrintError('_execute方法不应抛出任何异常', e);
				shutdown(66);
			}
		}

		if (this.result.success) {
			this.logger.verbose`${this.result}`;
			this.logger.success`生成成功`;
			return this.result;
		} else {
			this.logger.error`生成失败`;
			throw this.result.error; // catch by pool
		}
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
			this.logger.debug`应该运行，因为从未执行过`;
			return ExecuteReason.NeedExecute;
		}
		if (!this.result.success) {
			this.logger.debug`上一次执行失败，应该运行`;
			return ExecuteReason.NeedExecute;
		}
		for (const watch of this.result.userWatchFiles) {
			if (trigger.has(watch)) {
				this.logger.debug`用户监听的文件已更改，应该运行: ${watch}`;
				return ExecuteReason.NeedExecute;
			}
			if (watch.endsWith('/')) {
				for (const file of trigger) {
					if (file.startsWith(watch)) {
						this.logger.debug`用户监听的文件夹已更改，应该运行: ${file}`;
						return ExecuteReason.NeedCompile;
					}
				}
			}
		}
		for (const watch of this.systemWatchingFiles) {
			if (trigger.has(watch)) {
				this.logger.debug`源文件已更改，应该重新编译: ${watch}`;
				return ExecuteReason.NeedCompile;
			}
		}
		this.logger.debug`不需要运行`;
		return ExecuteReason.NoNeed;
	}
}
