#!/usr/bin/env node

import { createRootLogger, logger } from '@idlebox/logger';
import { join, relative, resolve } from 'node:path';
import { monorepoRoot, globalNodeModules } from './common/constants.js';
import { listPnpm } from './common/monorepo.js';
import { ensureSymLinkSync } from './common/pre-post-inc.js';

createRootLogger('post-install');

logger.log`modules dir: long<${globalNodeModules}>`;
const tools = {
	tsc: 'typescript/bin/tsc',
	eslint: 'eslint/bin/eslint.js',
	biome: '@biomejs/biome/bin/biome',
};

for (const { path } of await listPnpm()) {
	if (monorepoRoot === path) {
		continue;
	}

	linkTools(path);
}

function linkTools(projRoot: string) {
	const localBinDir = resolve(monorepoRoot, projRoot, 'node_modules/.bin');
	for (const [tool, path] of Object.entries(tools)) {
		const targetFile = relative(localBinDir, join(globalNodeModules, path));
		const linkFile = resolve(localBinDir, tool);
		ensureSymLinkSync(linkFile, targetFile);
	}
}
