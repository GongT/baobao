import { convertCaughtError, Emitter } from '@idlebox/common';
import { logger, type IMyLogger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { channelClient } from '@mpis/client';
import { glob, type GlobOptionsWithFileTypesFalse } from 'glob';
import { readFileSync } from 'node:fs';
import { realpath } from 'node:fs/promises';
import { basename, dirname, relative } from 'node:path';
import asyncPool from 'tiny-async-pool';
import type { BaseExecuter } from './executer.base.js';
import { ExecuteReason, formatResult, serialMode } from './shared.js';

export interface IResult {
	/**
	 * all generator.ts files count
	 */
	count: number;
	/**
	 * how many generator.ts files will be executed
	 */
	schedule: number;
	/**
	 * count files success write out
	 */
	success: number;
	/**
	 * count files unchanged
	 */
	skip: number;
	/**
	 * count and detail failed execute
	 */
	errors: { error: Error; source: string }[];
}

function nextTick() {
	return new Promise((resolve) => {
		process.nextTick(resolve);
	});
}

class Collection {
	private readonly generators = new Set<BaseExecuter>();

	constructor(private readonly logger: IMyLogger) {}

	add(gen: BaseExecuter) {
		if (this.has(gen.sourceFile)) {
			throw new Error(`Generator with id ${gen.sourceFile} already exists.`);
		}
		gen.onBeforeDispose(() => {
			this.generators.delete(gen);
		});
		this.generators.add(gen);
	}

	get size() {
		return this.generators.size;
	}

	async shrink(ids: Set<string>) {
		const ps = [];
		for (const gen of this.generators.values()) {
			if (ids.has(gen.sourceFile)) continue;
			this.logger.debug(`  - dispose: ${relative(process.cwd(), gen.sourceFile)}`);
			ps.push(gen.dispose());
		}

		await Promise.all(ps);
	}

	has(id: string) {
		return this.generators.values().some((e) => e.sourceFile === id);
	}

	keys() {
		return this.generators.values().map((e) => e.sourceFile);
	}
	values() {
		return this.generators.values();
	}
	dispose() {
		return this.shrink(new Set());
	}
}

export class GeneratorHolder {
	private readonly generators;
	private readonly _onComplete = new Emitter<void>();
	public readonly onComplete = this._onComplete.register;
	private readonly logger = logger.extend('project');
	private readonly knownPackageJsonList = new Set<string>();

	constructor(
		public readonly roots: readonly string[],
		private readonly Executer: new (...args: ConstructorParameters<typeof BaseExecuter>) => BaseExecuter,
	) {
		this.generators = new Collection(this.logger);
	}

	get size() {
		return this.generators.size;
	}

	private async matchAll() {
		const allFiles: string[] = [];
		for (const root of this.roots) {
			const globOptions: GlobOptionsWithFileTypesFalse = {
				cwd: root,
				absolute: true,
				ignore: ['node_modules/**'],
			};
			const files = await glob('**/*.generator.ts', globOptions);
			allFiles.push(...files);
		}
		return await Promise.all(
			allFiles.map((file) => {
				return realpath(file);
			}),
		);
	}

	async configureCodeGenerators() {
		const files = new Set(await this.matchAll());

		this.logger.debug(`(re)configure generators (${files.size}):`);

		/**
		 * 添加新的
		 */
		const knownPackage = new Set<string>();
		const absToPackage = new Map<string, string>();

		for (const abs of files) {
			const rel = relative(process.cwd(), abs);

			if (this.generators.has(abs)) {
				this.logger.debug(`  - exists: ${rel}`);
				continue;
			}

			this.logger.debug(`  - new: ${rel}`);
			const packagejson = findUpUntilSync({ file: ['package.json', 'package.yaml'], from: abs });
			if (!packagejson) {
				throw new Error(`failed find package.json|yaml for ${abs}`);
			}
			this.knownPackageJsonList.add(packagejson);

			absToPackage.set(abs, packagejson);
			knownPackage.add(packagejson);
		}

		for (const [abs, packagejson] of absToPackage.entries()) {
			let logger: IMyLogger;

			if (knownPackage.size > 1) {
				const name = JSON.parse(readFileSync(packagejson, 'utf-8')).name;
				logger = this.logger.extend(`${name}:${basename(abs, '.generator.ts')}`);
			} else {
				logger = this.logger.extend(basename(abs, '.generator.ts'));
			}
			const gen = new this.Executer(abs, { projectRoot: dirname(packagejson) }, logger);

			this.generators.add(gen);
		}

		/**
		 * 删除旧的
		 */
		await this.generators.shrink(files);

		this.logger.debug(`${this.generators.size} generator registed`);
	}

	executeAll() {
		return this.executeRelated(new Set(this.generators.keys()));
	}

	async executeRelated(trigger: ReadonlySet<string>): Promise<IResult> {
		const toBeExec = [];
		for (const gen of this.generators.values()) {
			const reason = gen.shouldExecute(trigger);
			if (reason === ExecuteReason.NoNeed) continue;

			toBeExec.push(gen);
			if (reason === ExecuteReason.NeedCompile) {
				await gen.build();
			}
		}
		const result: IResult = {
			count: this.generators.size,
			schedule: toBeExec.length,
			success: 0,
			skip: 0,
			errors: [],
		};

		if (!toBeExec.length) {
			this.logger.debug(`should execute none of ${result.count} generators`);
			channelClient.success(`no generators should execute`);
			return result;
		}
		this.logger.log(`should execute ${result.schedule} of ${result.count} generators`);
		this.logger.info(' Start Generate');

		channelClient.start();

		async function execute(generator: BaseExecuter) {
			try {
				generator.logger.verbose(`<pool> task started.`);

				await nextTick();
				const gr = await generator.execute();
				if (gr.changes) {
					result.success += gr.changes;
				} else {
					result.skip += gr.totalFiles - gr.changes;
				}

				generator.logger.verbose('<pool> task finished.');
			} catch (err) {
				generator.logger.debug('<pool> task errored.');
				result.errors.push({ error: convertCaughtError(err), source: generator.sourceFile });
			}
		}

		for await (const _ of asyncPool(serialMode ? 1 : 4, toBeExec, execute)) {
			// no op, just waiting for all tasks to finish
		}

		this.logger.log(`${result.success} files success, ${result.skip} files unchange/skip, ${result.errors.length} errors`);

		if (result.errors.length) {
			this.logger.error(`💥💥💥 generate fail: ${result.errors.length} errors`);
		} else {
			this.logger.success(`✅✅✅ generate success.`);
		}

		const msg = formatResult(result);
		console.error(msg);

		this._onComplete.fire();

		if (result.errors.length) {
			channelClient.failed(`${result.errors.length} error occurred in ${toBeExec.length} generators`, msg);
		} else {
			channelClient.success(`no error in ${toBeExec.length} generators`);
		}

		return result;
	}

	getAllWatchingFiles() {
		const files = new Set<string>(this.generators.keys());

		for (const gen of this.generators.values()) {
			for (const file of gen.watchingFiles(false)) {
				files.add(file);
			}
		}

		return [...files];
	}

	async dispose() {
		await this.generators.dispose();
	}
}
