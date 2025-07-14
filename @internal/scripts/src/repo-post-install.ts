#!/usr/bin/env node

import { createRootLogger, logger } from '@idlebox/logger';
import { relativePath } from '@idlebox/node';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import packageJson from '../package.json' with { type: 'json' };
import { globalNodeModules, monorepoRoot } from './common/constants.js';
import { listPnpm } from './common/monorepo.js';
import { ensureSymLinkSync } from './common/pre-post-inc.js';

createRootLogger('post-install');

logger.log`modules dir: long<${globalNodeModules}>`;
const tools: Record<string, string> = {
	tsc: 'typescript/bin/tsc',
	eslint: 'eslint/bin/eslint.js',
	biome: '@biomejs/biome/bin/biome',
	publisher: '@mpis/publisher/loader/bin.devel.js',
};

for (const [tool, path] of Object.entries(packageJson.bin)) {
	tools[tool] = join(packageJson.name, path);
}

for (const { path } of await listPnpm()) {
	if (monorepoRoot === path) {
		continue;
	}

	linkTools(path);
}

function linkTools(projRoot: string) {
	const localNodeModules = resolve(monorepoRoot, projRoot, 'node_modules');
	const localBinDir = resolve(localNodeModules, '.bin');
	for (const [tool, path] of Object.entries(tools)) {
		const targetFile = findFirstExistsBin(projRoot, path);

		const linkFile = resolve(localBinDir, tool);
		ensureSymLinkSync(linkFile, relativePath(localBinDir, targetFile));
	}
}

function findFirstExistsBin(projRoot: string, toolBin: string) {
	const localTargetFile = resolve(monorepoRoot, projRoot, 'node_modules', toolBin);
	const globalTargetFile = join(globalNodeModules, toolBin);
	const rigTargetFile = join(monorepoRoot, '@internal/local-rig', 'node_modules', toolBin);

	for (const file of [localTargetFile, globalTargetFile, rigTargetFile]) {
		if (existsSync(file)) {
			return file;
		}
	}

	const pkg = resolve(monorepoRoot, projRoot, 'package.json');
	throw logger.fatal`无法为子项目 long<${pkg}> 找到工具 ${toolBin} 的可执行文件`;
}
