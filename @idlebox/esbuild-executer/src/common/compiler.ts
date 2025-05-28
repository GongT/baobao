import esbuild from 'esbuild';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { MessagePort } from 'node:worker_threads';
import { isTrue } from './cli.js';
import { decideExternal } from './external-decider.js';
import { logger } from './logger.js';
import type { IExecuteOptions, ISourceMapMessage } from './message.types.js';
import { createDebugOutput } from './write_debug_file.js';

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

export async function compileFile(tsFile: string, options: IExecuteOptions, port: MessagePort) {
	// const packageJsonFile = findPackageJSON(tsFile);
	// if (!packageJsonFile) {
	// 	throw new Error(`can not find package.json for ${tsFile}`);
	// }

	const plugins = [decideExternal, esbuildWarningPlugin];

	const srcList = [fileURLToPath(tsFile)];
	if (options?.entries) {
		srcList.push(...options.entries.map((e) => fileURLToPath(e)));
	}
	const outDir = getLowestCommonAncestor(srcList.map((e) => dirname(e)));
	const entryMapping: { in: string; out: string }[] = [];
	for (const entry of srcList) {
		const rel = relative(outDir, entry);
		entryMapping.push({ in: rel, out: rel.replace(tsExt, '') });
	}

	if (isTrue('WRITE_COMPILE_RESULT')) {
		plugins.push(createDebugOutput());
	}

	// const wd = tmpdir();

	logger.esbuild`compiling files: ${outDir}`;
	logger.esbuild`${entryMapping}`;
	const context = await esbuild.context({
		absWorkingDir: outDir,
		entryPoints: entryMapping,
		bundle: true,
		format: 'esm',
		minify: false,
		sourcemap: true,
		write: false,
		platform: 'node',
		outdir: outDir,
		outbase: outDir,
		// logLevel: 'info',
		entryNames: '[name]',
		splitting: srcList.length > 1,
		treeShaking: true,
		metafile: true,
		logLevel: 'silent',
		conditions: ['source', 'esbuild', 'import', 'default'],
		banner: {
			js: 'const require = (await import("node:module")).createRequire(import.meta.dirname);',
		},
		outExtension: { '.js': '.ts' },
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
	if (srcList.length === 1 && result.outputFiles.length !== 2) {
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
		});
	},
};

const resolveFailed = /Cannot find module '(?<module>.+)' imported from (?<importer>.+)/;

function esbuildMessage(basedir: string, messages: readonly esbuild.Message[]) {
	for (const message of messages) {
		const pname = message.pluginName || 'main';

		const m = resolveFailed.exec(message.text);
		if (m) {
			logger.error`\x1B[38;5;9m[esbuild:${pname}] 💥 解析import失败\x1B[0m`;
			logger.error`  模块  : ${m.groups?.module}`;
			logger.error`  导入者: ${m.groups?.importer}`;
		} else {
			logger.error`[esbuild:${pname}] 💥 ${message.text}`;
		}

		if (message.location) {
			logger.error`📄 ${resolve(basedir, message.location.file)}:${message.location.line}:${message.location.column}`;
		}
		addonNote(basedir, message.notes);
	}
}

function addonNote(basedir: string, notes: readonly esbuild.Note[]) {
	for (const note of notes) {
		logger.error`⚠️ ${note.text}`;
		if (note.location) {
			const location = `${resolve(basedir, note.location.file)}:${note.location.line}:${note.location.column}`;
			logger.error`  at ${location}`;
		}
	}
}
