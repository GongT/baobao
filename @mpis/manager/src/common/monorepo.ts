import type { IPackageJson } from '@idlebox/common';
import { loadJsonFile, readCommentJsonFile } from '@idlebox/json-edit';
import { logger } from '@idlebox/logger';
import { DepGraph } from 'dependency-graph';
import { execa } from 'execa';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import type { IBuildConfigJson } from './build.json.js';
import { workspaceRoot } from './constants.js';
import { inspect } from 'node:util';

interface IPnpmListProject {
	name: string;
	version: string;
	path: string;
	private: boolean;
}
export async function listProjects(): Promise<IPnpmListProject[]> {
	const result = await execa('pnpm', ['m', 'ls', '--json', '--depth=-1'], {
		cwd: workspaceRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
	});

	return JSON.parse(result.stdout);
}

async function getDependencies(absolutePath: string, json: IPackageJson): Promise<string[]> {
	let dependencies: string[] = [];

	const overrideFile = resolve(absolutePath, 'config/build.json');
	if (existsSync(overrideFile)) {
		const overrideJson: IBuildConfigJson = await readCommentJsonFile(overrideFile);
		if (Array.isArray(overrideJson.dependencies)) {
			dependencies.push(...overrideJson.dependencies);

			for (const name of dependencies) {
				if (
					!json.dependencies?.[name].startsWith('workspace:') ||
					!json.devDependencies?.[name].startsWith('workspace:')
				) {
					logger.fatal(
						`override file long<${overrideFile}> dependency "${name}" must specified in package.json with version "workspace:^"`,
					);
				}
			}

			return dependencies;
		}
	}

	if (json.dependencies) {
		for (const [name, version] of Object.entries(json.dependencies)) {
			if (version.startsWith('workspace:')) {
				dependencies.push(name);
			}
		}
	}
	if (json.devDependencies) {
		for (const [name, version] of Object.entries(json.devDependencies)) {
			if (version.startsWith('workspace:')) {
				dependencies.push(name);
			}
		}
	}

	return dependencies;
}

async function loadProjectInfo(absolutePath: string): Promise<IGraphData> {
	const pkgPath = `${absolutePath}/package.json`;
	const pkgJson = await loadJsonFile(pkgPath);
	const dependencies = await getDependencies(absolutePath, pkgJson);

	return {
		packagePath: pkgPath,
		packageJson: pkgJson as IPackageJson,
		dependencies: dependencies,
	};
}

interface IGraphData {
	readonly packagePath: string;
	readonly packageJson: IPackageJson;
	readonly dependencies: readonly string[];
}
