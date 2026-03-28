import esbuild from 'esbuild';
import assert from 'node:assert';
import { realpathSync } from 'node:fs';
import { builtinModules } from 'node:module';
import { basename, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainThread } from 'node:worker_threads';
import { enables } from '../common/env.js';
import type { IImportOptions } from '../common/message.types.js';
import { inspectMode, writeTempFiles } from './bridge.js';
import { decideExternal } from './external-decider.js';
import { logger } from './logger.js';
import { createPostProcess } from './post-process.js';

assert.equal(isMainThread, false, '主线程不应该加载这个模块');

export type BuildResult = esbuild.BuildResult<{ write: false; metafile: true }>;

const anyExtension = /\..+$/;

function getLowestCommonAncestor(files: string[]): string {
	const commonParts = files.reduce((acc, file) => {
		const parts = file.split('/');
		if (acc.length === 0) {
			return parts;
		}
		let i = 0;
		while (i < acc.length && i < parts.length && acc[i] === parts[i]) {
			i++;
		}
		return acc.slice(0, i);
	}, [] as string[]);

	commonParts.push('');

	return commonParts.join('/');
}

interface IEntryOptions {
	readonly entryPoints: { in: string; out: string }[];
	readonly ancestor: string;
}

function createEntryMapping(entries: string[]): IEntryOptions {
	const srcList = entries.map((e) => fileURLToPath(e));
	const outDir = getLowestCommonAncestor(srcList.map((e) => dirname(e)));

	const entryMapping: { in: string; out: string }[] = [];
	for (const entry of srcList) {
		const rel = relative(outDir, entry);
		const outbase = basename(rel).replace(anyExtension, '');

		entryMapping.push({ in: rel, out: outbase });
	}

	return {
		entryPoints: entryMapping,
		ancestor: outDir,
	};
}

/**
 * 编译文件
 *
 * @returns resultMap: key 是输出文件的路径，value 是编译后的内容
 * @returns metadata: esbuild的metafile内容
 */
export async function compileFile(tsFile: string, options: IImportOptions) {
	// const packageJsonFile = findPackageJSON(tsFile);
	// if (!packageJsonFile) {
	// 	throw new Error(`can not find package.json for ${tsFile}`);
	// }

	const shouldWrite = writeTempFiles || inspectMode || options.write || !!process.env.WRITE_COMPILE_RESULT;
	const plugins = [decideExternal, createPostProcess(shouldWrite, options)];

	const { entryPoints, ancestor } = createEntryMapping([tsFile, ...(options?.entries ?? [])]);

	// const wd = tmpdir();
	const outdir = resolve(ancestor, '.esbuild-executer');
	logger.esbuild`compiling files: ${ancestor}: ${entryPoints}`;
	try {
		const result: BuildResult = await esbuild.build({
			absWorkingDir: ancestor,
			entryPoints: entryPoints,
			bundle: true,
			format: 'esm',
			minify: false,
			sourcemap: true,
			write: false,
			platform: 'node',
			outdir: outdir,
			outbase: ancestor,
			chunkNames: '.chunk.[name]_[hash]',
			entryNames: '.entry.[name]_[hash]',
			splitting: entryPoints.length > 1,
			minifyIdentifiers: false,
			minifySyntax: false,
			minifyWhitespace: false,
			treeShaking: true,
			metafile: true,
			logLevel: 'silent',
			conditions: ['node', 'import', 'default'],
			external: ['source-map-support', 'source-map', ...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
			banner: {
				js: 'const require = (await import("node:module")).createRequire(import.meta.dirname);',
			},
			outExtension: { '.js': shouldWrite ? '.js' : '.virtual.js' },
			loader: {
				'.js': 'ts',
				'.ts': 'ts',
				'.json': 'json',
			},
			define: {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
				'import.meta.filename': 'convertMeta.filename',
				'import.meta.dirname': 'convertMeta.dirname',
				'import.meta.url': 'convertMeta.url',
				__dirname: 'convertMeta.dirname',
				__filename: 'convertMeta.filename',
			},
			plugins: plugins,
			// tsconfigRaw: '{"compilerOptions": {"": ""}}',
		});

		logger.esbuild`compiled successfully`;

		if (entryPoints.length === 1 && result.outputFiles.length !== 2) {
			throw new Error(`expected 2 output files, got ${result.outputFiles.length}`);
		}

		return {
			ancestor: ancestor,
			outDir: outdir,
			result: result,
		};
	} catch (e: any) {
		if (e.errors?.length || e.warnings?.length) {
			printEsbuildResult(ancestor, e);
			throw new Error(`未能构建源文件"${tsFile}"`);
		}
		throw e;
	}
}

export function printEsbuildResult(basedir: string, result: BuildResult) {
	esbuildMessage(basedir, result.errors);
	esbuildMessage(basedir, result.warnings);

	if (result.errors.length > 0 || result.warnings.length > 0) {
		if (enables.esbuild) {
			logger.esbuild`esbuild发生了以上错误`;
		} else {
			logger.output`向 DEBUG 添加 "executer:*" 以查看额外调试输出`;
		}
	} else {
		logger.esbuild`esbuild编译成功，没有错误和警告`;
	}
}

const resolveFailed = /Cannot find module '(?<module>.+)' imported from (?<importer>.+)/;
const knownSequence = /\x1B(\[[0-9;]+m|c|\d*[A-GJK]|\].+(\x1B\\|\x07))/gm;
const lineStart = /^/gm;
const lineEnding = /$/gm;

function esbuildMessage(basedir: string, messages: readonly esbuild.Message[]) {
	enables.esbuild = true;
	for (const message of messages) {
		const pname = message.pluginName || 'main';

		const m = resolveFailed.exec(message.text);
		if (m) {
			logger.error`\x1B[38;5;9m[esbuild:${pname}] 💥 解析import失败\x1B[0m`;
			logger.output`  模块  : ${m.groups?.module}`;
			logger.output`  导入者: ${m.groups?.importer}`;
		} else {
			logger.error`[esbuild:${pname}] 💥 ${message.text}`;
		}

		if (message.location) {
			logger.output`  文件  : ${location(basedir, message.location)}`;
		}

		const colorBlock = '\x1B[48;5;13m \x1B[0m \x1B[2m';
		if (message.detail) {
			let detail = message.detail.toString().replace(knownSequence, '').trim();
			detail = detail.replace('\x1B', '\\e');
			detail = detail.replace(lineStart, colorBlock);
			detail = detail.replace(lineEnding, '\x1B[0m');
			detail += '\n';

			logger.output([detail]);
		} else {
			logger.output`\x1B[2m<no detail>\x1B[0m`;
		}

		addonNote(basedir, message.notes);
		logger.output``;
	}
}

function addonNote(basedir: string, notes: readonly esbuild.Note[]) {
	for (const note of notes) {
		logger.output`⚠  ${note.text}`;
		if (note.location) {
			logger.output`     ${location(basedir, note.location)}`;
		}
	}
}

function location(basedir: string, loc: esbuild.Location) {
	let abs = resolve(basedir, loc.file);
	try {
		abs = realpathSync(abs);
	} catch {}
	return `${abs}:${loc.line}:${loc.column}`;
}
