import { readFileSync } from 'fs';
import { Module } from 'module';
import { dirname } from 'path';
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript';
import { writeFileIfChange } from '../../misc/functions';
import { IOutputShim } from '../../misc/scopedLogger';
import { FileBuilder } from './inc/builder';

const header = `/* eslint-disable */
// @ts-ignore
/**
 * 
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 */
`;

export function run(files: string[], logger: IOutputShim) {
	for (const f of files) {
		runOne(f, logger);
	}
}

function runOne(filePath: string, logger: IOutputShim) {
	logger.debug('process: ' + filePath);

	const code = transpileModule(readFileSync(filePath, 'utf-8'), {
		compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ESNext },
		fileName: filePath,
	});
	const mdl = new Module(filePath);
	const fn = new Function('exports', 'require', 'module', '__filename', '__dirname', 'logger', code.outputText);
	fn.call(undefined, mdl.exports, mdl.require, mdl, filePath, dirname(filePath), logger);
	const { generate } = mdl.exports;

	if (typeof generate !== 'function') {
		throw new Error('generator did not exporting {generate} function: ' + filePath);
	}
	const builder = new FileBuilder(filePath);
	let content: string = generate(builder);
	if (builder === (content as any)) {
		content = builder.toString();
	}
	if (typeof content !== 'string') {
		throw new Error('the {generate} function did not return string: ' + filePath);
	}

	content = header + '\n\n' + content;
	const change = writeFileIfChange(filePath.replace(/\.generator\.[jt]s$/, '.generated.ts'), content);
	if (change) logger.debug('  - change.');
}
