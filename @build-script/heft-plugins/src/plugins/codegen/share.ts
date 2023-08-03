import { PromisePool } from '@supercharge/promise-pool';
import { rmSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { Module, createRequire } from 'module';
import { basename, dirname } from 'path';
import ts from 'typescript';
import { writeFileIfChange } from '../../misc/functions';
import { IOutputShim, wrapLogger } from '../../misc/scopedLogger';
import { FileBuilder } from './inc/builder';

let isDebug = false;

const header = `/* eslint-disable */
// @ts-ignore
/*
 * 
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 */
`;

export interface IResult {
	success: number;
	skip: number;
	errors: Error[];
	watchFiles: Record<string, string[]>;
}

export async function run(files: string[], mainLog: IOutputShim) {
	isDebug = process.argv.includes('--debug');
	const result: IResult = { success: 0, skip: 0, errors: [], watchFiles: {} };
	await new PromisePool()
		.withConcurrency(4)
		.for(files)
		.process(async (f) => {
			const childLog = wrapLogger(mainLog, `[${basename(f, '.generator.ts')}] `);
			const builder = new FileBuilder(f, childLog);
			try {
				const change = await runOne(builder, childLog);
				if (change) result.success++;
				else result.skip++;
			} catch (e: any) {
				result.errors.push(e);
			}
			result.watchFiles[f] = builder.getWatchedFiles();
		});

	return result;
}

async function runOne(builder: FileBuilder, logger: IOutputShim) {
	logger.debug('process: ' + builder.filePath);

	const execute = isDebug ? executeDebug : executeNormal;
	let content = await execute(builder.filePath, logger, builder);

	if (builder === content) {
		content = builder.toString();
	} else if (content === undefined) {
		content = builder.toString();
		if (!content) throw new Error('generate function not create output string.');
	}
	if (typeof content !== 'string') {
		throw new Error('the {generate} function did not return string (or promise string): ' + builder.filePath);
	}

	content = header + '\n\n' + content;
	const change = writeFileIfChange(builder.filePath.replace(/\.generator\.[jt]s$/, '.generated.ts'), content);
	if (change) logger.debug('  - change.');

	return change;
}

async function compileModule(filePath: string, logger: IOutputShim) {
	const raw = await readFile(filePath, 'utf-8');
	const code = ts.transpileModule(raw, {
		compilerOptions: {
			module: ts.ModuleKind.CommonJS,
			target: ts.ScriptTarget.ESNext,
			inlineSourceMap: true,
		},
		fileName: filePath,
	});

	if (code.diagnostics?.length) {
		const f = ts.formatDiagnostics(code.diagnostics, {
			getCanonicalFileName(fileName) {
				return fileName;
			},
			getCurrentDirectory() {
				return dirname(filePath);
			},
			getNewLine() {
				return '\n';
			},
		});
		throw new Error('typescript transpile errors: ' + f);
	} else {
		logger.debug('compiled generater code success.');
	}

	return code.outputText;
}

async function executeNormal(
	filePath: string,
	logger: IOutputShim,
	builder: FileBuilder,
): Promise<FileBuilder | string> {
	const code = await compileModule(filePath, logger);
	let stage = 'require module';
	try {
		const require = createRequire(filePath);

		const mdl = new Module(filePath);
		mdl.require = require;
		const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', code);
		fn.call(undefined, mdl.exports, mdl.require, mdl, filePath, dirname(filePath));
		const generate = mdl.exports.generate;

		stage = 'generate';

		if (typeof generate !== 'function') {
			throw new Error('generator did not exporting {generate} function: ' + filePath);
		}

		return await generate(builder);
	} catch (e: any) {
		const ne = new Error(`failed ${stage} "${basename(filePath)}": ${e.message}`);
		ne.stack = ne.message;
		throw ne;
	}
}

async function executeDebug(
	filePath: string,
	logger: IOutputShim,
	builder: FileBuilder,
): Promise<FileBuilder | string> {
	const decache = require('decache');
	let code = await compileModule(filePath, logger);
	const tmpFile = filePath + '.generated.cjs';

	Object.assign(globalThis, { _1diRName: dirname(filePath), _1filEName: filePath });
	code = code.replace(/\b__dirname\b/g, '_1diRName');
	code = code.replace(/\b__filename\b/g, '_1filEName');

	await writeFile(tmpFile, code);

	try {
		const require = createRequire(filePath);
		const generate = require(tmpFile).generate;

		if (typeof generate !== 'function') {
			throw new Error('generator did not exporting {generate} function: ' + filePath);
		}

		return await generate(builder);
	} catch (e: any) {
		+e.stack;
		throw e;
	} finally {
		decache(tmpFile);
		logger.debug('delete temp file: %s', tmpFile);
		rmSync(tmpFile, { force: true });
		Object.assign(globalThis, { _1diRName: undefined, _1filEName: undefined });
	}
}
