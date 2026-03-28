/**
 * 通过 [source-map-support](https://www.npmjs.com/package/source-map-support) 注册一个 source map 寻找器
 *
 * 实现虚拟文件的 source map 支持
 * source-map-support注册的 retrieveSourceMap 会叠加，返回 null 调用下一个
 */

import assert from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isMainThread } from 'node:worker_threads';
import { SourceMapConsumer } from 'source-map-js';
import { inspectEnabled, isTrue, masterOutput } from './cli.js';

assert.equal(isMainThread, true, 'Worker引用了主线程代码');

const debug = masterOutput('source-map');
const schema = /^file:\/\//;
const startingAt = /^at\s+/;
const startingSlash = /^\/+/;

const sourceMaps = new Map<string, any>();
export function addVirtualSourceMap(key: string, value: any) {
	sourceMaps.set(key, value);
	debug(`added source map for: ${key}`);
}

function filePath(stack: string) {
	const location = stack.split('\n')[2]?.trim() ?? ''; // 第一行是Error，第二行是 Proxy.get
	const match = /([^(:]+)([0-9:]*)(|\))$/gm.exec(location);
	if (!match) throw new Error(`无法解析调用位置: "${location}"`);

	const file = match[1].replace(startingAt, '').replace(startingSlash, '/');
	const lineColumn = match[2]?.[0] === ':' ? match[2].slice(1) : '';

	return { file, lineColumn };
}

function convertMeta(file: string, prop: string) {
	if (prop === 'filename') {
		return file;
	} else if (prop === 'dirname') {
		return dirname(file);
	} else if (prop === 'url') {
		return `file://${file}`;
	}
	throw new Error(`unsupported import.meta property: ${prop}`);
}

function useSimpleReturn() {
	debug('[import.meta] use simple stack resolver');
	Object.defineProperty(globalThis, 'convertMeta', {
		value: new Proxy(
			{},
			{
				get(_target: any, prop: string) {
					if (prop !== 'filename' && prop !== 'dirname' && prop !== 'url') {
						throw new Error(`unsupported import.meta property: ${prop.toString()}`);
					}

					const err = new Error(prop.toString());
					assert.ok(err.stack, 'Error stack is required for import.meta resolve');
					return convertMeta(filePath(err.stack).file, prop);
				},
			},
		),
	});
}

function useSourceMapped() {
	debug('[import.meta] use source mapped resolver');
	Object.defineProperty(globalThis, 'convertMeta', {
		value: new Proxy(
			{},
			{
				get(_target: any, prop: string) {
					if (prop !== 'filename' && prop !== 'dirname' && prop !== 'url') {
						throw new Error(`unsupported import.meta property: ${prop.toString()}`);
					}

					const err = new Error(prop.toString());
					assert.ok(err.stack, 'Error stack is required for import.meta resolve');
					const { file, lineColumn } = filePath(err.stack);
					const [line, column] = lineColumn.split(':').map(Number);

					debug(`resolving source map for: ${file} at ${lineColumn}`);

					// const inputIsCompiled = file.includes('.esbuild-executer');

					const map = getSourceMap(`file://${file}`);
					if (!map) {
						let maps = 'registed maps:';
						for (const key of sourceMaps.keys()) {
							maps += `\n  - ${key}`;
						}
						throw new Error(`[import.meta.${prop}] no source map found for: ${file}\n${maps}`);
					}

					const output = getSourcePosition(map.map, line, column);
					debug(`  - ${output.source}:${output.line}`);

					const mapped = resolve(file, '..', output.source);

					return convertMeta(mapped, prop);
				},
			},
		),
	});
}

export async function registerSourceMapper() {
	const userDisabled = isTrue('DISABLE_SOURCE_MAP');
	const nativeSourceMapEnabled = process.execArgv.includes('--enable-source-maps');

	if (nativeSourceMapEnabled) {
		useSimpleReturn();
	} else if (inspectEnabled || userDisabled) {
		useSourceMapped();
	} else {
		// 有 source-map-support 的话stack已经处理过
		useSimpleReturn();
	}

	if (inspectEnabled || userDisabled) {
		debug(`not register source map: inspectEnabled=${inspectEnabled}, userDisabled=${userDisabled}`);
		return;
	}

	debug('register source map');
	const { install } = await import('@idlebox/source-map-support');
	const ok = install({
		retrieveSourceMap: getSourceMap,
	});

	debug(`source-map-support install result: ${ok}`);
	if (!ok) {
		throw new Error('failed to install source-map-support');
	}
}

function getSourceMap(source: string) {
	const map = sourceMaps.get(source);
	if (map) {
		debug(`matched virtual source map for: ${source}`);
		return { url: source.replace(schema, ''), map: map };
	} else if (source.startsWith('file://')) {
		const src = `${source}.map`;
		const abs = fileURLToPath(src);
		if (existsSync(abs)) {
			debug(`found source map file at: ${abs}`);
			return { url: src, map: JSON.parse(readFileSync(abs, 'utf-8')) };
		}
	}
	debug(`no virtual source map for: ${source}`);
	return null;
}

function getSourcePosition(mapFileContent: any, row: number, column: number) {
	// Parse the source map
	const consumer = new SourceMapConsumer(mapFileContent);

	// Get the original position
	const originalPosition = consumer.originalPositionFor({
		line: row,
		column: column,
	});

	if (originalPosition.source) {
		return {
			source: originalPosition.source,
			line: originalPosition.line,
			column: originalPosition.column,
			name: originalPosition.name,
		};
	} else {
		throw new Error('Original position not found in source map.');
	}
}
