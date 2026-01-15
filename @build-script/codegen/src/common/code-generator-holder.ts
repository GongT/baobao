import { Emitter } from '@idlebox/common';
import { findUpUntilSync } from '@idlebox/node';
import { channelClient } from '@mpis/client';
import { readFileSync } from 'node:fs';
import { basename, dirname, relative } from 'node:path';
import asyncPool from 'tiny-async-pool';
import { CodeGenerator } from './code-generator.js';
import { Logger, type ILogger } from './output.js';
import { ExecuteReason, formatResult } from './shared.js';

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

class GeneratorCollection {
	private readonly generators = new Set<CodeGenerator>();

	constructor(private readonly logger: ILogger) {}

	add(gen: CodeGenerator) {
		if (this.has(gen.id)) {
			throw new Error(`Generator with id ${gen.id} already exists.`);
		}
		gen.onDispose(() => {
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
			if (ids.has(gen.id)) continue;
			this.logger.debug(`  - dispose: ${relative(process.cwd(), gen.id)}`);
			ps.push(gen.dispose());
		}

		await Promise.all(ps);
	}

	has(id: string) {
		return this.generators.values().some((e) => e.id === id);
	}

	keys() {
		return this.generators.values().map((e) => e.id);
	}
	values() {
		return this.generators.values();
	}
	dispose() {
		return this.shrink(new Set());
	}
}

class GeneratorHolder {
	private readonly generators;
	private readonly _onComplete = new Emitter<void>();
	public readonly onComplete = this._onComplete.register;
	private readonly logger = Logger('project');
	private readonly knownPackageJsons = new Set<string>();

	constructor() {
		this.generators = new GeneratorCollection(this.logger);
	}

	get size() {
		return this.generators.size;
	}

	async configureCodeGenerators(files: string[]) {
		this.logger.debug(`(re)configure generators (${files.length}):`);
		const used = new Set<string>();
		const knownPackage = new Set<string>();
		const absToPackge = new Map<string, string>();

		for (const abs of files) {
			used.add(abs);
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
			this.knownPackageJsons.add(packagejson);

			absToPackge.set(abs, packagejson);
			knownPackage.add(packagejson);
		}

		for (const [abs, packagejson] of absToPackge.entries()) {
			let logger: ILogger;

			if (knownPackage.size > 1) {
				const name = JSON.parse(readFileSync(packagejson, 'utf-8')).name;
				logger = Logger(name).wrap(basename(abs, '.generator.ts'));
			} else {
				logger = Logger(basename(abs, '.generator.ts'));
			}
			const gen = new CodeGenerator(dirname(packagejson), abs, logger);

			this.generators.add(gen);
		}

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

			toBeExec.push({
				generator: gen,
				reason,
			});
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

		async function execute({ generator, reason }: { generator: CodeGenerator; reason: ExecuteReason }) {
			try {
				generator.logger.verbose(`<pool> task started (${ExecuteReason[reason]}).`);

				await nextTick();
				const gr = await generator.compileRun(reason);
				if (gr.changes) {
					result.success += gr.changes;
				} else {
					result.skip += gr.totalFiles - gr.changes;
				}

				generator.logger.verbose('<pool> task finished.');
			} catch (err: any) {
				generator.logger.verbose('<pool> task errored.');
				result.errors.push({ error: err, source: generator.id });
			}
		}

		for await (const _ of asyncPool(4, toBeExec, execute)) {
			// no op, just waiting for all tasks to finish
		}

		this.logger.log(`${result.success} files success, ${result.skip} files unchange/skip, ${result.errors.length} errors`);

		if (result.errors.length) {
			this.logger.boom(`generate fail: ${result.errors.length} errors`);
		} else {
			this.logger.checked(`generate success.`);
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
			for (const file of gen.relatedFiles()) {
				files.add(file);
			}
		}

		return [...files];
	}

	async dispose() {
		await this.generators.dispose();
	}
}

export const generatorHolder = new GeneratorHolder();
