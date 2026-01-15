/**
 * biome-ignore-all lint/performance/useTopLevelRegex: builder
 *
 */
import { CommandDefine } from '@idlebox/cli-help-builder';
import type { IPackageJson } from '@idlebox/common';
import { findUpUntil } from '@idlebox/node';
import { globSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildOutput } from './rollup-build.js';

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
	const packageJsonPath = await findUpUntil({ file: 'package.json', from: root_dir });
	if (!packageJsonPath) throw new Error(`package.json not found from ${root_dir}`);
	const packageJson: IPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

	const files = globSync(globs, { cwd: glob_from }).map((i) => resolve(glob_from, i));

	const built = await buildOutput(root_dir, files, packageJsonPath, packageJson);

	let typeFrom = '';
	if (hasDep(packageJson, '@idlebox/cli')) {
		typeFrom = '@idlebox/cli';
	} else if (hasDep(packageJson, '@idlebox/cli-help-builder')) {
		typeFrom = '@idlebox/cli-help-builder';
	} else {
		throw new Error(`can not determine type source from ${packageJsonPath}`);
	}

	const tempEntryFile = `${root_dir}/.generated.temp.cli.js`;
	writeFileSync(tempEntryFile, built);
	const output: IExports = await import(tempEntryFile);

	const obj = convertCommandsToJson(output);
	const json = JSON.stringify(obj, null, '\t');

	unlinkSync(tempEntryFile);

	return `import type { ICommandDefineWithCommand } from '${typeFrom}';
export const cli_commands: readonly ICommandDefineWithCommand[] = ${json};
export const cli_imports = ${JSON.stringify(output.imports, null, '\t')} as const;`;
}

interface IExports {
	commands: Record<string, new () => CommandDefine>;
	imports: Record<string, string>;
}

function convertCommandsToJson(commands: IExports) {
	const array = [];
	const errors: string[] = [];
	for (const [command, Class] of Object.entries(commands.commands)) {
		if (typeof Class !== 'function') {
			errors.push(`命令 "${command}" 类型定义不正确: 没有导出 “Command” 类`);
			continue;
		}
		if (typeof Class !== 'function' || !(Class.prototype instanceof CommandDefine)) {
			errors.push(`命令 "${command}" 类型定义不正确: Command 应继承 CommandDefine`);
			continue;
		}
		// console.log(`command: ${command}, class: ${JSON.stringify(obj.toJSON())}`);

		const obj = new Class();

		array.push({
			command,
			...obj.toJSON(),
		});
	}

	if (errors.length) {
		throw new Error(`构建命令行索引失败，共 ${errors.length} 个错误: \n  - ${errors.join('\n  - ')}`);
	}

	return array;
}
