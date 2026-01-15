import { camelCase, escapeRegExp, ucfirst, type IPackageJson } from '@idlebox/common';
import { relativePath } from '@idlebox/node';
import commonjsPlugin from '@rollup/plugin-commonjs';
import { nodeResolve as nodeResolvePlugin } from '@rollup/plugin-node-resolve';
import swcPlugin from '@rollup/plugin-swc';
import { dirname, parse } from 'node:path';
import { rollup } from 'rollup';
import { createVirtualIndex } from './create-virtual-index.js';
import { plogger } from './logger.js';
import { transformPlugin } from './transform.js';

const isTypescript = /\.[mc]?ts[x]?$/i;

async function makeText(root: string, source_files: readonly string[]) {
	let content = '';
	let usingTypescript: boolean | undefined;

	const clsMap = new Map<string, string>();
	const importMap = new Map<string, string>();

	for (const filePath of source_files) {
		const name = parse(filePath).name;
		const cls = `${ucfirst(camelCase(name))}Command`;
		clsMap.set(name, cls);

		const shouldUseTypescript = isTypescript.test(filePath);
		if (typeof usingTypescript === 'boolean' && shouldUseTypescript !== usingTypescript) {
			throw new Error('can not mix typescript and javascript');
		}
		usingTypescript = shouldUseTypescript;

		let relative = relativePath(root, filePath);
		if (usingTypescript) {
			relative = relative.replace(isTypescript, '.js');
		}
		if (!relative.startsWith('.')) {
			relative = `./${relative}`;
		}

		importMap.set(name, relative);
		content += `import { Command as ${cls} } from '${relative}';\n`;
	}

	content += 'export const commands = {\n';
	for (const [name, cls] of clsMap) {
		content += `\t${JSON.stringify(name)}: ${cls},\n`;
	}
	content += '};\n';

	content += 'export const imports = {\n';
	for (const [name, relative] of importMap) {
		content += `\t${JSON.stringify(name)}: ${JSON.stringify(relative)},\n`;
	}
	content += '};\n';

	return content;
}

export async function buildOutput(targetRoot: string, files: readonly string[], packagePath: string, packageJson: IPackageJson) {
	const content = await makeText(targetRoot, files);
	const virtualIndex = createVirtualIndex(targetRoot, content);

	try {
		const bannerCode = [`const require = (await import("node:module")).createRequire(import.meta.dirname);`];

		const externals = [];
		if (packageJson.dependencies) externals.push(...Object.keys(packageJson.dependencies));
		if (packageJson.peerDependencies) externals.push(...Object.keys(packageJson.peerDependencies));

		await using response = await rollup({
			input: virtualIndex.input,
			external: externals,
			treeshake: {
				moduleSideEffects: () => false,
				propertyReadSideEffects: false,
				tryCatchDeoptimization: false,
				unknownGlobalSideEffects: false,
			},
			onwarn(warning) {
				if (warning.code?.includes('UNUSED')) {
					plogger.debug`[${warning.code}] ${warning.message}`;
				} else {
					plogger.warn`[${warning.code}] ${warning.message}`;
				}
			},
			plugins: [
				nodeResolvePlugin({
					exportConditions: ['import', 'node', 'default'],
					allowExportsFolderMapping: false,
					dedupe: [],
					extensions: ['.js', '.ts'],
					preferBuiltins: true,
				}),
				swcPlugin({
					swc: {
						minify: false,
						jsc: {
							parser: {
								syntax: 'typescript',
								decorators: false,
								tsx: false,
							},
						},
					},
				}),
				virtualIndex.plugin,
				transformPlugin(files),
				commonjsPlugin({}),
			],
		});

		const { output: outputs } = await response.generate({
			banner: bannerCode.join('\n'),
			format: 'esm',
			dir: dirname(virtualIndex.input),
			sourcemap: 'inline',
		});

		if (outputs.length !== 1) {
			throw new Error(`build output not single: ${outputs.map((i) => `${i.type}: ${i.name}`).join(', ')}`);
		}
		const output = outputs[0];
		if (output.type !== 'chunk') {
			throw new Error(`build output not chunk: ${output.type}`);
		}

		// console.log('rollup-ed', output);

		return output.code;
	} catch (e: any) {
		if (e.name === 'RollupError') {
			const pkgRoot = dirname(packagePath);
			const rel = relativePath(pkgRoot, virtualIndex.input);
			console.log(e);

			const msg = `[${e.pluginCode}] ${e.plugin}:${e.hook}: ${e.message}`
				// src/xxx.ts (000:000) => remove
				.replace(new RegExp(`${escapeRegExp(rel)} \\(\\d+:\\d+\\)\\s*:?\\s*`, 'g'), '')
				.replaceAll(rel, packagePath);
			const ee = new Error(`不能生成命令行索引文件，请检查代码是否可以通过编译:\n${msg}`);
			ee.name = 'BuildFailure';
			throw ee;
		} else {
			throw e;
		}
	}
}
