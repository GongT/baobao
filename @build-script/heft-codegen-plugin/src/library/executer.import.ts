import { writeFileIfChange, type IOutputShim } from '@build-script/heft-plugin-base';
import { format } from 'node:util';
import type { GeneratorBody } from './code-generator.js';
import { BaseExecuter, type IGenerateResult } from './executer.base.js';
import { FileBuilder } from './file-builder.js';
import type { ILogMessage } from './shared.js';

function interop(mdl: any) {
	return mdl?.default ?? mdl;
}

const header = `/* eslint-disable */
// @ts-ignore
/*
 * 
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 */
`;

function createCollectLogger(outputs: ILogMessage[], parent: IOutputShim): IOutputShim {
	const keys = ['log', 'error', 'debug', 'verbose', 'warn'] as const;
	const child: IOutputShim = {} as any;
	for (const key of keys) {
		const fn: Function = parent[key].bind(parent);
		child[key] = (...args: any[]) => {
			fn(...args);
			outputs.push({
				type: key,
				message: format(...args),
			});
		};
	}
	return child;
}

export class ImportExecuter extends BaseExecuter {
	async _execute(compiledFile: string): Promise<IGenerateResult> {
		const outputs: ILogMessage[] = [];
		let result: string | undefined, success: boolean;

		const logger = createCollectLogger(outputs, this.logger);

		let gen: GeneratorBody = undefined as any;
		try {
			gen = interop(await import(compiledFile));
			if (typeof gen.generate !== 'function') {
				return this.errorResult(new Error(`module ${this.sourceFile} must export "generate" function`));
			}
			const builder = new FileBuilder(this.sourceFile, logger, this.projectRoot);

			const r = await gen.generate(builder, logger);
			success = true;

			if (r) {
				if (typeof r !== 'string') {
					return this.errorResult(new Error(`generate function must return string (or no return)`));
				}
				if (builder.size > 0) {
					logger.warn('generate return and builder.append both used, builder.append will be ignored');
				}
				result = r;
			} else {
				result = builder.toString();
			}

			let changes = false;
			logger.verbose('write file: ' + this.targetFile);
			changes = writeFileIfChange(this.targetFile, header + '\n' + result);
			logger.verbose(`  - ${changes ? 'changed' : 'unchanged'}`);
			return {
				outputs,
				changes,
				success,
				userWatchFiles: builder.watchingFiles,
			};
		} catch (e: any) {
			return this.errorResult(new Error(`failed execute generator [${this.sourceFile}]: ${e?.stack ?? e}`));
		} finally {
			if (gen) {
				gen.dispose?.(logger);
			}
		}
	}
}
