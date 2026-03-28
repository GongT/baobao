import { prettyFormatStack } from '@idlebox/common';
import { createLogger, NodejsOutput, type IMyLogger } from '@idlebox/logger';
import { CollectingStream, writeFileIfChangeSync } from '@idlebox/node';
import { mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { Context, type IGenerateFunction } from '../client/generate-context.js';
import type { IGenerateResult } from '../common/spawn/messages.js';

interface IOptions {
	readonly projectRoot: string;
	readonly sourceFile: string;
	readonly logger: IMyLogger;
	readonly generate: IGenerateFunction;
}

const errorNameReg = /^(\w+): (.+)$/;

export async function callGenerateFunction(opts: IOptions) {
	let success = false;

	const collect = new CollectingStream();
	const logger = createLogger(opts.logger.tag, {
		console: new NodejsOutput({
			stream: collect,
			colorEnabled: opts.logger.colorEnabled,
		}),
	});

	const ctx = new Context(opts.sourceFile, logger, opts.projectRoot);

	try {
		const defaultOutput = await opts.generate(ctx, logger);
		success = true;

		if (defaultOutput) {
			const base = basename(opts.sourceFile);
			const newFile = ctx.file(base.replace('.generator.', '.'));
			newFile.append(defaultOutput);
		}
	} catch (e: any) {
		const lines = [];
		for (const line of e.stack.split('\n')) {
			lines.push(line);

			if (line.includes(opts.sourceFile)) {
				break;
			}
		}
		const firstLine = lines.shift();
		const match = errorNameReg.exec(firstLine);

		let message, name;
		if (!match) {
			message = firstLine;
			name = 'Error';
		} else {
			name = match[1];
			message = match[2];
		}

		const stack = opts.logger.colorEnabled ? prettyFormatStack(lines) : lines;

		const ee = new Error(`failed execute generator: ${message}`);
		ee.name = name;
		ee.stack = `${name}: ${message}\n${stack.join('\n')}`;

		return errorResult(ee);
	}

	if (ctx.size === 0) {
		return errorResult(new Error(`generate function return undefined, and no files emitted`));
	}

	const files = ctx.__commit();
	let numChange = 0;
	logger.debug(`emit ${files.length} files`);
	for (const { content, path } of files) {
		mkdirSync(dirname(path), { recursive: true });
		const ch = writeFileIfChangeSync(path, content);
		if (ch) {
			logger.log`write file: relative<${path}>`;
			numChange++;
		} else {
			logger.verbose`unchanged file: relative<${path}>`;
		}
	}

	const userWatchFiles = [];
	const dir = dirname(opts.sourceFile);
	for (const item of ctx.watchingFiles) {
		userWatchFiles.push(join(dir, item));
	}

	return {
		outputs: collect.getOutput(),
		changes: numChange,
		totalFiles: ctx.size,
		success,
		userWatchFiles: userWatchFiles,
	} satisfies IGenerateResult;
}

function errorResult(err: Error): IGenerateResult {
	return {
		changes: 0,
		totalFiles: 0,
		success: false,
		outputs: `${err.message}\n${err.stack || '<no stack trace available>'}`,
		error: err,
		userWatchFiles: [],
	};
}
