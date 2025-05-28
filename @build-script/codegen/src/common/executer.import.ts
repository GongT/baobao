import { prettyFormatStack } from '@idlebox/common';
import { writeFileIfChangeSync } from '@idlebox/node';
import { basename, relative } from 'node:path';
import { Context } from '../client/generate-context.js';
import type { GeneratorBody } from './code-generator.js';
import { BaseExecuter, type IGenerateResult } from './executer.base.js';
import { colorMode, createCollectLogger, type ILogMessage } from './shared.js';

// const generatorSuffix = /\.generator\.ts$/;

function interop(mdl: any) {
	return mdl?.default ?? mdl;
}

export const executerFile = 'src/common/executer.import.ts';

export class ImportExecuter extends BaseExecuter {
	async _execute(compiledFile: string): Promise<IGenerateResult> {
		const outputs: ILogMessage[] = [];
		let success: boolean;

		const logger = createCollectLogger(outputs, this.logger);
		const ctx = new Context(this.sourceFileAbs, logger, this.projectRoot);

		const gen: GeneratorBody = interop(
			await import(`${compiledFile}?t=${Date.now()}`, { with: { my_loader: 'compiled' } })
		);

		if (typeof gen.generate !== 'function') {
			return this.errorResult(new Error(`module ${this.sourceFileAbs} must export "generate" function`));
		}

		try {
			const defaultOutput = await gen.generate(ctx, logger);
			success = true;

			if (defaultOutput) {
				const base = basename(this.sourceFileAbs);
				const newFile = ctx.file(base.replace('.generator.', '.'));
				newFile.append(defaultOutput);
			}
		} catch (e: any) {
			const lines = [];
			for (const line of e.stack.split('\n')) {
				lines.push(line);

				if (line.includes(executerFile)) {
					break;
				}
			}
			let [name, message] = lines.shift().split(': ');
			if (!message) {
				message = name;
				name = 'Error';
			}

			const stack = colorMode ? prettyFormatStack(lines) : lines;

			const ee = new Error(`failed execute generator: ${message}`);
			ee.name = name;
			ee.stack = `${name}: ${message}\n${stack.join('\n')}`;

			return this.errorResult(ee);
		} finally {
			if (gen) {
				gen.dispose?.(logger);
			}
		}

		if (ctx.size === 0) {
			return this.errorResult(new Error(`generate function return undefined, and no files emitted`));
		}

		const files = ctx.__commit();
		let numChange = 0;
		this.logger.debug(`emit ${files.length} files`);
		for (const { content, path } of files) {
			const ch = writeFileIfChangeSync(path, content);
			if (ch) {
				this.logger.log(`write file: ${relative(this.projectRoot, path)}`);
				numChange++;
			} else {
				this.logger.verbose(`unchanged file: ${relative(this.projectRoot, path)}`);
			}
		}

		return {
			outputs,
			changes: numChange,
			totalFiles: ctx.size,
			success,
			userWatchFiles: ctx.watchingFiles,
		};
	}
}
