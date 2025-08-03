import { Emitter } from '@idlebox/common';
import type esbuild from 'esbuild';
import { resolve } from 'node:path';
import type { Context } from '../client/generate-context.js';
import type { BaseExecuter, IGenerateResult } from './executer.base.js';
import { ImportExecuter } from './executer.import.js';
import { createEsbuildContext, type IOptions } from './module-loading-transpile.js';
import type { ILogger } from './output.js';
import { ExecuteReason } from './shared.js';

export interface GeneratorBody {
	generate(builder: Context, logger: ILogger): Promise<string | undefined>;
	dispose?(logger: ILogger): Promise<any>;
}

export class CodeGenerator {
	private context?: esbuild.BuildContext<IOptions>;
	private lastSuccessfulExecute?: IGenerateResult;
	private compileResult?: esbuild.BuildResult<IOptions>;
	private readonly packageFile;
	private readonly executer: BaseExecuter;
	public readonly id: string;

	constructor(
		private readonly buildFolder: string, // path to nearest package.json folder
		private readonly entryFileAbs: string, // absolute path of *.generator.ts
		public readonly logger: ILogger,
	) {
		this.id = entryFileAbs;

		const packageFile = resolve(buildFolder, 'package.json');
		this.packageFile = packageFile;

		this.executer = new ImportExecuter(buildFolder, entryFileAbs, this.logger);
	}

	private async createContext(force = false) {
		if (!this.context || force) {
			this.ensureDisposeContext();
			this.logger.debug('create context');

			this.context = await createEsbuildContext(this.entryFileAbs, this.packageFile, this.logger);
		}
		return this.context;
	}

	shouldExecute(trigger: ReadonlySet<string>) {
		if (!this.compileResult) {
			this.logger.verbose("should run because compileResult doesn't exist");
			return ExecuteReason.NeedCompile;
		}

		// const watchingFiles =
		for (const abs of this.esbuildInputFiles()) {
			if (trigger.has(abs)) {
				this.logger.verbose(`should run because related file has changed: ${abs}`);
				return ExecuteReason.NeedCompile;
			}
		}

		return this.executer.shouldExecute(trigger);
	}

	async compileRun(reason: ExecuteReason) {
		if (reason === ExecuteReason.NeedCompile || !this.compileResult) {
			this.compileResult = undefined;
			try {
				const context = await this.createContext();
				this.compileResult = await context.rebuild();
			} catch (e) {
				this.logger.error(`failed compile generater script: ${this.entryFileAbs}`);
				throw e;
			}

			const hasError = printEsbuildErrors(this.logger, this.compileResult);
			if (hasError) {
				this.compileResult = undefined;
				throw new Error('failed compile generater script: has compile error.');
			}
		}

		const result = await this.executer.execute(this.entryFileAbs);
		this.lastSuccessfulExecute = result;
		return result;
	}

	*relatedFiles() {
		if (this.lastSuccessfulExecute?.userWatchFiles.size) {
			for (const file of this.lastSuccessfulExecute.userWatchFiles) {
				yield file;
			}
		}
		yield* this.esbuildInputFiles();
	}

	*esbuildInputFiles() {
		yield this.packageFile;
		yield this.entryFileAbs;

		if (this.compileResult) {
			for (const rel of Object.keys(this.compileResult.metafile.inputs)) {
				yield resolve(this.buildFolder, rel);
			}
		}
	}

	private readonly _onDispose = new Emitter<void>();
	public readonly onDispose = this._onDispose.register;
	async dispose() {
		this._onDispose.fire();
		this._onDispose.dispose();
		this.ensureDisposeContext();
	}

	private async ensureDisposeContext() {
		if (this.context) {
			this.logger.verbose('dispose context');
			const ctx = this.context;
			this.context = undefined;
			await ctx.dispose();
		}
	}
}

function printEsbuildErrors(logger: ILogger, result: esbuild.BuildResult) {
	if (result.errors.length === 0 && result.warnings.length === 0) {
		logger.debug(`generator script compiled success: ${result.outputFiles?.[0].hash}`);
		return false;
	}

	const entry = Object.values(result.metafile?.outputs ?? {}).find((e) => e.entryPoint)?.entryPoint;
	logger.error(`esbuild compile with errors (while bundle ${entry}):`);
	for (const { text, location } of result.errors) {
		console.error(`✘ [ERROR] ${text}`);
		if (location) {
			console.error(`    ${location.file}:${location.line}:${location.column}:`);
		}
	}
	for (const { text, location } of result.warnings) {
		console.error(`✘ [WARN] ${text}`);
		if (location) {
			console.error(`    ${location.file}:${location.line}:${location.column}:`);
		}
	}
	return true;
}
