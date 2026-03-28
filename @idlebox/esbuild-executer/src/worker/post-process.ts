import { basename, resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { IAddFileResponse, IImportOptions, ISourceMapMessage } from '../common/message.types.js';
import { inspectMode, postMessage } from './bridge.js';
import { logger } from './logger.js';

import type esbuild from 'esbuild';
import type { BuildOptions } from 'esbuild';
import assert from 'node:assert';
import { isMainThread } from 'node:worker_threads';
import { FileBulkWriter } from './bulk-write.js';
import type { BuildResult } from './compiler.js';

assert.equal(isMainThread, false, '主线程不应该加载这个模块');

const extension = /\.([mc]?tsx?|json|[mc]?jsx?)$/i;

export function createPostProcess(shouldWrite: boolean, importOptions: IImportOptions): esbuild.Plugin {
	return {
		name: 'post-process-and-write-files',
		setup(build) {
			build.onEnd(async (result) => {
				if (!result.outputFiles) throw new Error('esbuild did not produce output files');
				const information = await postProcess(result, build.initialOptions, shouldWrite);

				postMessage({
					type: 'compiled',
					tsFile: information.tsFileUrl,
					success: true,
					buildInfo: {
						outputToEntry: information.outputToEntry,
						resultEntryFile: information.resultEntryFile,
						inputFiles: information.filesToWatch,
					},
					options: importOptions,
				} satisfies IAddFileResponse);
			});
		},
	};
}

function first(entryPoints: BuildOptions['entryPoints']): string {
	assert.ok(Array.isArray(entryPoints) && entryPoints.length > 0);
	const first = entryPoints.at(0);
	assert.ok(typeof first === 'object');

	return first.in;
}

function structuralResult(result: BuildResult, tsFileUrl: string, ancestor: string) {
	let resultEntryFile: string | undefined;
	const outputToEntry: Record<string, string> = {};
	for (const [path, meta] of Object.entries(result.metafile.outputs)) {
		if (!meta.entryPoint) continue;

		const source = pathToFileURL(resolvePath(ancestor, meta.entryPoint)).href;
		const dist = pathToFileURL(resolvePath(ancestor, path)).href;

		outputToEntry[dist] = source;
		logger.worker` * ${source} → ${dist}`;

		if (tsFileUrl === source) {
			resultEntryFile = dist;
		}
	}

	if (!resultEntryFile) {
		throw new Error(
			`entry file not found in result:\n  + ${tsFileUrl}\n${Object.values(outputToEntry)
				.map((k) => `  - ${k}`)
				.join('\n')}`,
		);
	}

	return { resultEntryFile, outputToEntry };
}

async function postProcess(result: BuildResult, buildOptions: BuildOptions, shouldWrite: boolean) {
	const ancestor = buildOptions.absWorkingDir;
	const outdir = buildOptions.outdir;
	const firstEntry = first(buildOptions.entryPoints);
	assert.ok(ancestor && outdir && firstEntry);

	const tsFileUrl = pathToFileURL(resolvePath(ancestor, firstEntry)).href;
	const outputs = new FileBulkWriter(buildOptions, shouldWrite);

	const { resultEntryFile, outputToEntry } = structuralResult(result, tsFileUrl, ancestor);

	// logger.worker` ? ${inspect(result.metafile, { colors: true, depth: 3 })}`;
	// for (const { path, hash } of result.outputFiles) {
	// 	logger.worker` - [${hash}] ${path}`;
	// }
	// logger.worker` ? ${outDir}`;

	outputs.metafile(result.metafile);

	for (const file of result.outputFiles) {
		if (file.path.endsWith('.map')) {
			outputs.write(file);

			const src = file.path.slice(0, -4);
			postMessage({
				type: 'source-map',
				sourceMap: file.contents,
				fileUrl: pathToFileURL(src).href,
			} satisfies ISourceMapMessage);
		} else {
			const distUrl = pathToFileURL(file.path).href;
			const inputFileUrl = outputToEntry[distUrl]; // file path

			let compiledInfo: ICompiledFile;
			if (inspectMode) {
				compiledInfo = {
					kind: 'file',
					fileUrl: distUrl,
					inputFilePath: inputFileUrl?.slice(7),
				};
			} else {
				compiledInfo = {
					kind: 'virtual',
					fileUrl: distUrl,
					content: file.contents,
					inputFilePath: inputFileUrl?.slice(7),
				};
			}

			outputs.write(file, `/* create by source: ${inputFileUrl} */`);

			addOrSet(distUrl, compiledInfo);
			if (inputFileUrl) {
				const renamedFrom = inputFileUrl.replace(extension, '.js');
				addOrSet(renamedFrom, compiledInfo);

				const deleteStructure = pathToFileURL(resolvePath(outdir, basename(renamedFrom))).href;
				addOrSet(deleteStructure, compiledInfo);
			}
		}
	}

	const filesToWatch = Object.keys(result.metafile.inputs).map((f) => resolvePath(ancestor, f));

	logger.worker`compiled from ${filesToWatch.length} files, result entry: ${resultEntryFile}`;

	await outputs.finish();

	return { tsFileUrl, outputToEntry, resultEntryFile, filesToWatch };
}

const invalidJoin = /\/file:\//g;
function addOrSet(fileUrl: string, file: ICompiledFile) {
	logger.verbose`${_compiledFiles.has(fileUrl) ? 'update file' : 'add file'}: ${fileUrl}`;
	if (invalidJoin.test(fileUrl)) throw new Error(`invalid file url: ${fileUrl}`);
	_compiledFiles.set(fileUrl, file);
}

/**
 * 编译文件结果数据
 */
const _compiledFiles = new Map<string, ICompiledFile>();
export const compiledFiles = {
	get(fileUrl: string) {
		return _compiledFiles.get(fileUrl);
	},
	dump() {
		logger.resolve`known files:`;
		for (const k of _compiledFiles.keys()) {
			logger.resolve`  - ${k}`;
		}
	},
};

type ICompiledFile =
	| {
			// 正常模式下的编译结果，直接从内存加载（也可能写入了磁盘，但不会加载）
			readonly kind: 'virtual';
			readonly fileUrl: string;
			readonly content: Uint8Array;
			readonly inputFilePath?: string;
	  }
	| {
			// inspect模式下的编译结果，直接从磁盘加载
			readonly kind: 'file';
			readonly fileUrl: string;
			readonly inputFilePath?: string;
	  }
	| {
			// 用于将虚拟路径映射到实际文件
			readonly kind: 'alias';
			readonly fileUrl: string;
	  };
