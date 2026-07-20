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
			throw new Error(`生成器id ${gen.sourceFile} 已存在`);
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
			this.logger.debug(`  - 销毁: ${relative(process.cwd(), gen.sourceFile)}`);
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

		this.logger.debug`(重新)配置生成器 (${files.size}):`;

		/**
		 * 添加新的
		 */
		const knownPackage = new Set<string>();
		const absToPackage = new Map<string, string>();

		for (const abs of files) {
			const rel = relative(process.cwd(), abs);

			if (this.generators.has(abs)) {
				this.logger.debug`  - 已有: ${rel}`;
				continue;
			}

			this.logger.debug`  - 添加: ${rel}`;
			const packagejson = findUpUntilSync({ file: ['package.json', 'package.yaml'], from: abs });
			if (!packagejson) {
				throw new Error(`从目录"${abs}"向上找不到任何package.json(yaml)`);
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

		this.logger.debug`发现并注册了 ${this.generators.size} 个生成器`;
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
			this.logger.debug`${result.count}个生成器，均无需执行`;
			channelClient.success(`无需执行生成器`);
			return result;
		}
		this.logger.log`将执行 ${result.schedule} / ${result.count} 个生成器`;

		channelClient.start();

		async function execute(generator: BaseExecuter) {
			try {
				generator.logger.verbose`<执行池> 任务启动`;

				await nextTick();
				const gr = await generator.execute();
				if (gr.changes) {
					result.success += gr.changes;
				} else {
					result.skip += gr.totalFiles - gr.changes;
				}

				generator.logger.verbose`<执行池> 任务正常完成`;
			} catch (err) {
				generator.logger.debug`<执行池> 任务出错`;
				result.errors.push({ error: convertCaughtError(err), source: generator.sourceFile });
			}
		}

		for await (const _ of asyncPool(serialMode ? 1 : 4, toBeExec, execute)) {
			// no op, just waiting for all tasks to finish
		}

		this.logger.log`${result.success} 个, ${result.skip} 个未改变/跳过, ${result.errors.length} 个错误`;

		if (result.errors.length) {
			this.logger.error`💥💥💥 生成失败: ${result.errors.length} 个错误`;
		} else {
			this.logger.success`✅✅✅ 生成成功`;
		}

		const msg = formatResult(result);
		console.error(msg);

		this._onComplete.fire();

		if (result.errors.length) {
			channelClient.failed(`执行${toBeExec.length}个生成器时出现${result.errors.length}个错误`, msg);
		} else {
			channelClient.success(`执行${toBeExec.length}个生成器全部成功`);
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
