import type { LoadFnOutput, LoadHookContext, ResolveFnOutput, ResolveHookContext } from 'node:module';
import { resolve as resolvePath } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspectEnabled } from './common/cli.js';
import { compileFile, createEntryMapping } from './common/compiler.js';
import { logger, registerLogger } from './common/logger.js';
import type { IErrorMessage, IInitializeMessage, InitializeData } from './common/message.types.js';

type P<T> = T | Promise<T>;

export type NextResolve = (specifier: string, context?: Partial<ResolveHookContext>) => P<ResolveFnOutput>;

export type NextLoad = (url: string, context?: Partial<LoadHookContext>) => P<LoadFnOutput>;

let compiledFiles: undefined | Map<string, Uint8Array>;
let inspectModeEntryMapping: undefined | Map<string, string>;

export async function initialize({ options, port, tsFile }: InitializeData) {
	registerLogger(port);

	let entryFileUrl: string = tsFile;
	try {
		logger.worker`initialize worker with options: ${tsFile}, ${options}`;
		compiledFiles = await compileFile(tsFile, options, port);

		if (inspectEnabled) {
			logger.worker`inspect mode enabled, entry mapping:`;
			inspectModeEntryMapping = new Map();
			const { entryPoints, outDir } = createEntryMapping([tsFile, ...(options?.entries ?? [])]);
			for (const entry of entryPoints) {
				const from = pathToFileURL(resolvePath(outDir, entry.in)).toString();
				// biome-ignore lint/style/useTemplate: <explanation>
				const to = pathToFileURL(resolvePath(outDir, entry.out)).toString() + '.js';
				logger.worker`  ${from} -> ${to}`;
				inspectModeEntryMapping.set(from, to);
			}
			const shouldFoundEntry = inspectModeEntryMapping.get(tsFile);

			if (!shouldFoundEntry) {
				throw new Error(`inspect mode entry file not found: ${tsFile}`);
			}
			entryFileUrl = shouldFoundEntry;
		}

		logger.worker`initialized | entry file: ${entryFileUrl}`;

		port.postMessage({ type: 'initialize', entryFileUrl: entryFileUrl } satisfies IInitializeMessage);
	} catch (e: any) {
		port.postMessage({ type: 'error', message: e.message, stack: e.stack } satisfies IErrorMessage);
	}
}

export async function resolve(
	specifier: string,
	context: ResolveHookContext,
	nextResolve: NextResolve
): Promise<ResolveFnOutput> {
	if (context.importAttributes.type === 'metadata') {
		// esbuild编译过程中 使用回调解析node_modules，其实import.meta.resolve更好，但不是标准API，目前也需要flag
		const parentPath = context.importAttributes.parent;
		if (!parentPath) {
			throw new Error(`[impossible] missing hash in nodemodule specifier: ${specifier}`);
		}

		const id = specifier.split('?')[0];
		const parent = pathToFileURL(parentPath).href;

		const r = await nextResolve(id, {
			conditions: context.conditions,
			parentURL: parent,
		});
		logger.hook`resolve nodemodule: ${r}`;
		return {
			url: r.url,
			format: r.format,
			shortCircuit: true,
			importAttributes: {
				type: 'metadata',
			},
		};
	}

	logger.hook`<${compiledFiles ? 'runtime' : 'compile'}> resolve: ${specifier} (${context.importAttributes.type})`;
	if (!compiledFiles) {
		// 编译没有完成时，插件正在尝试分析路径
		const r = await nextResolve(specifier, context);
		logger.hook`resolved default: ${r}`;
		return r;
	}

	let absolute: string = specifier;
	if (absolute.startsWith('.') && context.parentURL) {
		absolute = new URL(absolute, context.parentURL).href;
		logger.hook`    turn to absolute: ${absolute}`;
	}

	const inspectEntry = inspectModeEntryMapping?.get(absolute);
	if (inspectEntry) {
		logger.hook`    found inspect mode entry!`;
		absolute = inspectEntry;
	}

	if (absolute && compiledFiles.has(absolute)) {
		logger.hook`    resolve memory result: ${absolute}`;
		return {
			url: absolute,
			format: 'module',
			shortCircuit: true,
		};
	}

	return nextResolve(specifier, context);
}

export function load(url: string, context: LoadHookContext, nextLoad: NextLoad): P<LoadFnOutput> {
	if (context.importAttributes.type === 'metadata') {
		return {
			format: 'module',
			source: `export const absolute = ${JSON.stringify(url)};export const format = ${JSON.stringify(context.format)};`,
			shortCircuit: true,
		};
	}

	logger.hook`try load: ${url} (${context.importAttributes.type})`;
	if (!compiledFiles) {
		// esbuild plugin is loading package.json
		return nextLoad(url, context);
	}

	const data = compiledFiles.get(url);
	if (data) {
		logger.hook`    load from memory`;
		return {
			format: 'module',
			source: data,
			shortCircuit: true,
		};
		// } else {
		// 	const knowns = [...compiledFiles.keys()];
		// 	logger.hook(`not found this module (${knowns.length}): ${url}`);
		// 	for (const k of knowns) {
		// 		logger.hook(`  - ${k}`);
		// 	}
	}
	return nextLoad(url, context);
}
