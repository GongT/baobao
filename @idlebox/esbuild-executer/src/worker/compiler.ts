import esbuild from 'esbuild';
import { realpathSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { MessagePort } from 'node:worker_threads';
import { enables } from '../common/env.js';
import type { IExecuteOptions, ISourceMapMessage } from '../common/message.types.js';
import { isTrue } from '../master/cli.js';
import { inspectEnabled } from './env.js';
import { decideExternal } from './external-decider.js';
import { logger } from './logger.js';
import { createDebugOutput, createInspectOutput } from './write_debug_file.js';

const tsExt = /\.ts$/;
const mapExt = /\.map$/;

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

export function createEntryMapping(entries: string[]) {
	const srcList = entries.map((e) => fileURLToPath(e));
	const outDir = getLowestCommonAncestor(srcList.map((e) => dirname(e)));

	const entryMapping: { in: string; out: string }[] = [];
	for (const entry of srcList) {
		const rel = relative(outDir, entry);

		let out = rel.replace(tsExt, '');

		if (inspectEnabled) {
			out = `._${out}.realtime-compile`;
		}

		entryMapping.push({ in: rel, out: out });
	}

	return {
		entryPoints: entryMapping,
		outDir,
	};
}

export async function compileFile(tsFile: string, options: IExecuteOptions, port: MessagePort) {
	// const packageJsonFile = findPackageJSON(tsFile);
	// if (!packageJsonFile) {
	// 	throw new Error(`can not find package.json for ${tsFile}`);
	// }

	const plugins = [decideExternal, esbuildWarningPlugin];

	const { entryPoints, outDir } = createEntryMapping([tsFile, ...(options?.entries ?? [])]);

	if (inspectEnabled) {
		plugins.push(createInspectOutput(outDir));
	} else if (isTrue('WRITE_COMPILE_RESULT')) {
		plugins.push(createDebugOutput());
	}

	// const wd = tmpdir();

	logger.esbuild`compiling files: ${outDir}`;
	logger.esbuild`${entryPoints}`;
	const context = await esbuild.context({
		absWorkingDir: outDir,
		entryPoints: entryPoints,
		bundle: true,
		format: 'esm',
		minify: false,
		sourcemap: true,
		write: false,
		platform: 'node',
		outdir: outDir,
		outbase: outDir,
		// logLevel: 'info',
		chunkNames: inspectEnabled ? '._chunk-[name]-[hash]' : 'chunk-[name]-[hash]',
		entryNames: '[name]',
		splitting: entryPoints.length > 1,
		treeShaking: true,
		metafile: true,
		logLevel: 'silent',
		conditions: ['node', 'import', 'default'],
		banner: {
			js: 'const require = (await import("node:module")).createRequire(import.meta.dirname);',
		},
		outExtension: { '.js': inspectEnabled ? '.js' : '.ts' },
		loader: {
			'.js': 'ts',
			'.ts': 'ts',
			'.json': 'json',
		},
		define: {
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
		},
		plugins: plugins,
		// tsconfigRaw: '{"compilerOptions": {"": ""}}',
	});

	let result: Awaited<ReturnType<typeof context.rebuild>>;
	try {
		result = await context.rebuild();
		logger.esbuild`compiled successfully`;
	} catch (e: any) {
		if (e.errors?.length) {
			// is esbuild normal error, already printed
			throw new Error(`can not build typescript file "${tsFile}"`);
		}
		throw e;
	} finally {
		await context.dispose();
	}

	const resultMap = new Map<string, Uint8Array>();
	if (entryPoints.length === 1 && result.outputFiles.length !== 2) {
		throw new Error(`expected 2 output files, got ${result.outputFiles.length}`);
	}
	for (const file of result.outputFiles) {
		if (file.path.endsWith('.map')) {
			const src = file.path.slice(0, -4);
			port.postMessage({
				type: 'source-map',
				sourceMap: file.contents,
				fileUrl: pathToFileURL(src).toString().replace(mapExt, ''),
			} satisfies ISourceMapMessage);
		} else {
			logger.esbuild`compiled file: ${file.path}`;
			resultMap.set(pathToFileURL(file.path).toString(), file.contents);
		}
	}

	return resultMap;
}

const esbuildWarningPlugin: esbuild.Plugin = {
	name: 'esbuild-error-handler',
	setup(build) {
		const basedir = build.initialOptions.absWorkingDir;
		if (!basedir) {
			throw new Error('esbuild initialOptions.absWorkingDir is not set');
		}
		build.onEnd(async (result) => {
			esbuildMessage(basedir, result.errors);
			esbuildMessage(basedir, result.warnings);

			if (result.errors.length > 0 || result.warnings.length > 0) {
				if (!enables.esbuild) {
					logger.output`向 DEBUG 添加 "executer:*" 以查看额外调试输出`;
				}
			}
		});
	},
};

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
			let detail = message.detail.replace(knownSequence, '').trim();
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
