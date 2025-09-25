import { readFileSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { GetManualChunk, Plugin } from 'rollup';
import type { Plugin as VitePlugin } from 'vite';
import { packageRoot } from './inc/constants.js';
import { getNode, hasMultipleVersion } from './inc/flatten.js';
import { pickupPackage } from './inc/helper.js';
import { checkAndUpdateCache } from './inc/pnpm.cache.js';

const invalidPathChars = /[^a-z0-9/._@+-]/gi;

function pickupAll(picked: Set<string>, ...names: (string | RegExp)[]) {
	const result = new Set<string>();
	for (const name of names) {
		pickupPackage(name, result, picked);
	}
	return result;
}

interface ManualChunkWorker {
	callback: GetManualChunk;
	readonly vendorPackages: Set<string>;
}

interface IChunkDef {
	readonly name: string;
	readonly packages: readonly (string | RegExp)[];
}

interface IOptions {
	/**
	 * 内部包的chunk名称，默认为 `_lib`
	 * 例如commonjs plugin的各种helper
	 *
	 * **tslib**会被自动放入此chunk
	 */
	internalChunk?: string;
	/**
	 * 不在node_modules里的本地代码chunk名称，默认为 `null`，表示不放入单一chunk
	 */
	customerChunk?: string | null;

	/**
	 * 所有未匹配的包的chunk名称，默认为 `vendor`
	 */
	vendorChunk?: string | null;

	/**
	 * 需要拆分的chunk定义，基本就是原本 manualChunks非callback 形式
	 * 注意此处需要明确顺序
	 *
	 * 例如: 如果先antd后react，则由于antd依赖react，绝大部分react会被一起放入antd chunk，通常这都不符合预期
	 */
	chunks: readonly IChunkDef[];
}

export function createManualChunks({ chunks, internalChunk = '_lib', customerChunk = null, vendorChunk = 'vendor' }: IOptions): ManualChunkWorker {
	checkAndUpdateCache();

	const packageNameToChunk = new Map<string, string>();

	const picked = new Set<string>();
	for (const { name, packages } of chunks) {
		const all = pickupAll(picked, ...packages);
		for (const pkg of all) {
			packageNameToChunk.set(pkg, name);
		}
	}

	packageNameToChunk.set('tslib', internalChunk);

	const vendorPackages = new Set<string>();

	function manualChunksCallback(oid: string): string | null {
		const [id, ..._typeArgs] = oid.trim().replace(invalidPathChars, '').split('?');

		if (!isAbsolute(id)) {
			// 插件内部引用，例如commonjs plugin的各种helper
			// console.log(`[relative] [${id}]`);
			return internalChunk;
		}

		if (!id.includes('/node_modules/')) {
			// 本地代码
			// console.log(`[app] ${id}`);
			return customerChunk;
		}

		const relId = id.slice(id.lastIndexOf('/node_modules/') + '/node_modules/'.length);
		const packageName = relId[0] === '@' ? relId.split('/', 2).slice(0, 2).join('/') : relId.split('/', 1)[0];
		// const pathInPackage = relId.slice(packageName.length + 1);

		const mapTo = packageNameToChunk.get(packageName);
		if (mapTo) {
			// console.log(`[mapped] ${packageName} -> ${mapTo} :: (${relId})`);
			return mapTo;
		}

		// console.log(`[vendor] ${packageName} :: (${relId})`);
		vendorPackages.add(packageName);
		return vendorChunk;
	}

	return {
		callback: manualChunksCallback,
		vendorPackages: vendorPackages,
	};
}

interface IExtraOptions extends IOptions {
	/**
	 * 打印未匹配的依赖包列表，默认true
	 */
	verbose?: boolean;

	/**
	 * 定义需要去重的包
	 * 自动添加到 config.resolve.dedupe
	 *
	 * config.resolve.dedupe 不会合并到此处
	 */
	dedupe?: readonly string[];
}

export function splitVendorPlugin(options: IExtraOptions): Plugin {
	const chunkTool = createManualChunks(options);

	const packageJson = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf-8'));

	const prefix = options.dedupe ? 'vite:' : '';

	const plugin: VitePlugin = {
		name: `${prefix}split-vendor`,
		outputOptions(options) {
			options.manualChunks = chunkTool.callback;
			chunkTool.vendorPackages.clear();
		},
	};
	if (options.verbose) {
		plugin.generateBundle = () => {
			console.error('\r\x1B[2mVendor packages (%d): %s\x1B[0m\n', chunkTool.vendorPackages.size, Array.from(chunkTool.vendorPackages).sort().join(' '));
		};
	}

	const dedup = options.dedupe;
	if (dedup) {
		plugin.config = (config) => {
			if (!config.resolve) config.resolve = {};
			if (!config.resolve.dedupe) config.resolve.dedupe = [];

			// const multi: string[] = [];
			for (const item of dedup) {
				if (!getNode(item)) {
					console.log('去重依赖 %s 没有在本项目使用', item);
					continue;
				}

				const duplicate = hasMultipleVersion(item);
				// if (duplicate && criticalPackages.includes(item)) {
				// 	// 存在多个版本，添加一个日志
				// 	multi.push(item);
				// }

				if (packageJson.dependencies?.[item] || packageJson.devDependencies?.[item]) {
					// 根项目依赖中存在，直接添加去重，可以实现强制覆盖
					config.resolve.dedupe.push(item);
					continue;
				}

				if (duplicate) {
					// 存在多个版本，且无法在根项目依赖中找到它，只能手动解决
					throw new Error(`依赖包 "${item}" 存在多个版本，且指定要去重，但根项目没有直接依赖它，必须先将需要的版本安装到 ${packageRoot}`);
				} else {
					// 没有多个版本，且根项目依赖中没有它，执行默认行为
				}
			}

			// if (multi.length > 0) {
			// 	console.warn(`\r\x1B[2m依赖包存在多个版本: ${multi.join(', ')}\x1B[0m`);
			// }
		};
	}

	return plugin;
}
