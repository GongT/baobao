import type { CommandDefine } from '@idlebox/cli-help-builder';
import { camelCase, ucfirst, type IPackageJson } from '@idlebox/common';
import { findUpUntil, relativePath } from '@idlebox/node';
import esbuild from 'esbuild';
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { glob } from 'node:fs/promises';
import { parse, resolve } from 'node:path';

const isTypescript = /\.[mc]?ts[x]?$/i;

async function makeText(root: string, globs: readonly string[], glob_from: string) {
	let content = '';
	let usingTypescript: boolean | undefined;

	const clsMap = new Map<string, string>();
	const importMap = new Map<string, string>();

	for await (const file of glob(globs, { cwd: glob_from })) {
		const name = parse(file).name;
		const cls = `${ucfirst(camelCase(name))}Command`;
		clsMap.set(name, cls);

		let absPath = resolve(glob_from, file);

		const shouldUseTypescript = isTypescript.test(absPath);
		if (typeof usingTypescript === 'boolean' && shouldUseTypescript !== usingTypescript) {
			throw new Error('can not mix typescript and javascript');
		}
		usingTypescript = shouldUseTypescript;

		if (usingTypescript) {
			absPath = absPath.replace(isTypescript, '.js');
		}

		let relative = relativePath(root, absPath);
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
	content += '}\n';

	content += 'export const imports = {\n';
	for (const [name, relative] of importMap) {
		content += `\t${JSON.stringify(name)}: ${JSON.stringify(relative)},\n`;
	}
	content += '}\n';

	return content;
}

function makeTmp(root: string) {
	const tmpdir = resolve(root, '.temp');
	if (existsSync(tmpdir)) {
		return {
			file: resolve(tmpdir, 'cli-build-exec.js'),
			deleteDir: false,
			tmpdir,
		};
	} else {
		mkdirSync(tmpdir, { recursive: true });
		return {
			file: resolve(tmpdir, 'cli-build-exec.js'),
			deleteDir: true,
			tmpdir,
		};
	}
}

function hasDep(pkg: IPackageJson, name: string) {
	if (pkg.dependencies?.[name]) {
		return true;
	}
	if (pkg.devDependencies?.[name]) {
		return true;
	}
	return false;
}

export async function makeIndexFile(root_dir: string, globs: readonly string[], glob_from = root_dir) {
	const content = await makeText(root_dir, globs, glob_from);
	const built = await buildOutput(root_dir, content);

	const packageJsonPath = await findUpUntil({ file: 'package.json', from: root_dir });
	if (!packageJsonPath) throw new Error(`package.json not found from ${root_dir}`);

	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

	let typeFrom = '';
	if (hasDep(packageJson, '@idlebox/cli')) {
		typeFrom = '@idlebox/cli';
	} else if (hasDep(packageJson, '@idlebox/cli-help-builder')) {
		typeFrom = '@idlebox/cli-help-builder';
	} else {
		throw new Error(`can not determine type source from ${packageJsonPath}`);
	}

	const tempDir = makeTmp(root_dir);
	try {
		writeFileSync(tempDir.file, built);
		const output: IExports = await import(tempDir.file);

		const obj = convertCommandsToJson(output);
		const json = JSON.stringify(obj, null, '\t');

		return `import type { ICommandDefineWithCommand } from '${typeFrom}';
export const cli_commands: readonly ICommandDefineWithCommand[] = ${json};
export const cli_imports = ${JSON.stringify(output.imports, null, '\t')} as const;`;
	} finally {
		if (tempDir.deleteDir) {
			rmSync(tempDir.tmpdir, { recursive: true });
		} else {
			unlinkSync(tempDir.file);
		}
	}
}

interface IExports {
	commands: Record<string, new () => CommandDefine>;
	imports: Record<string, string>;
}

function convertCommandsToJson(commands: IExports) {
	const array = [];
	for (const [command, Class] of Object.entries(commands.commands)) {
		const obj = new Class();

		array.push({
			command,
			...obj.toJSON(),
		});
		// console.log(`command: ${command}, class: ${JSON.stringify(obj.toJSON())}`);
	}

	return array;
}

async function buildOutput(root: string, content: string) {
	const bannerCode = [`const require = (await import("node:module")).createRequire(import.meta.dirname);`];
	const context = await esbuild.context({
		write: false,
		metafile: true,
		bundle: true,
		absWorkingDir: root,
		entryPoints: ['___memory___'],
		outdir: root,
		minifySyntax: false,
		treeShaking: true,
		sourcemap: 'inline',
		format: 'esm',
		platform: 'node',
		conditions: ['source', 'module', 'default'],
		minifyIdentifiers: false,
		charset: 'utf8',
		legalComments: 'none',
		banner: {
			js: bannerCode.join(''),
		},
		loader: {
			'.ts': 'ts',
			'.js': 'ts',
		},
		define: {
			__filename: 'import.meta.filename',
			__dirname: 'import.meta.dirname',
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
		},
		plugins: [
			{
				name: 'resolve-memory',
				setup(build) {
					build.onResolve({ filter: /./, namespace: 'file' }, async (args) => {
						if (args.pluginData?.isme) return null;
						const r = await build.resolve(args.path, {
							kind: args.kind,
							importer: args.importer,
							namespace: 'file',
							pluginData: { isme: true },
							pluginName: 'resolve-memory',
							resolveDir: args.resolveDir,
						});
						if (!r) return r;
						r.sideEffects = false;
						return r;
					});
					build.onResolve({ filter: /___memory___$/ }, () => {
						return { path: '___memory___', namespace: 'memory' };
					});
					build.onLoad({ filter: /^___memory___$/, namespace: 'memory' }, async () => {
						return { contents: content, resolveDir: root, loader: 'ts' };
					});
				},
			},
		],
	});
	try {
		const result = await context.rebuild();

		const outputNames = Object.keys(result.outputFiles);
		if (outputNames.length !== 1) {
			throw new Error(`build output not single: ${outputNames.join(', ')}`);
		}
		const output = result.outputFiles[outputNames[0] as any];

		// writeFile(resolve(root, '.commands.metadata.json'), JSON.stringify(result.metafile));

		return output.text;
	} finally {
		await context.dispose();
	}
}
