#!/usr/bin/env node

import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { relativePath, shutdown, writeFileIfChangeSync } from '@idlebox/node';
import assert from 'node:assert';
import { chmodSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import packageJson from '../package.json' with { type: 'json' };
import { listPnpm } from './common/monorepo.js';
import { globalNodeModules, monorepoRoot } from './common/paths/root.js';
import { ensureSymLinkSync } from './common/pre-post-inc.js';

createRootLogger('post-install', EnableLogLevel.verbose);

logger.log`modules dir: long<${globalNodeModules}>`;
const tools: Record<string, string> = {
	tsc: 'typescript/bin/tsc',
	biome: '@biomejs/biome/bin/biome',
	publisher: '@mpis/publisher/loader/bin.devel.js',
	knip: 'knip/bin/knip.js',
	'mpis-run': '@mpis/run/loader/bin.devel.js',
	codegen: '@build-script/codegen/loader/bin.devel.js',
	autoindex: '@build-script/autoindex/loader/bin.devel.js',
};

const gitHooks = resolve(monorepoRoot, '.git', 'hooks');
const preCommit = resolve(gitHooks, 'pre-commit');
assert.ok(process.env.NODE?.endsWith('pnpm'), 'not running by pnpm');
const ch = writeFileIfChangeSync(
	preCommit,
	`#!/bin/sh

${process.env.NODE} run hook:pre-commit
`,
);

if (ch) {
	console.log('pre-commit hook created');
	chmodSync(preCommit, 0o755);
}

for (const [tool, path] of Object.entries(packageJson.bin)) {
	tools[tool] = join(packageJson.name, path);
}

for (const { path } of await listPnpm()) {
	if (monorepoRoot === path) {
		continue;
	}

	linkTools(path);
}

shutdown(0);

function linkTools(projRoot: string) {
	logger.log`link tools inside long<${projRoot}>`;
	const localNodeModules = resolve(monorepoRoot, projRoot, 'node_modules');
	const localBinDir = resolve(localNodeModules, '.bin');
	for (const [tool, path] of Object.entries(tools)) {
		const targetFile = findFirstExistsBin(projRoot, tool, path);

		const linkFile = resolve(localBinDir, tool);
		ensureSymLinkSync(linkFile, relativePath(localBinDir, targetFile));
	}
}

function findFirstExistsBin(projRoot: string, tool: string, toolBin: string) {
	const localTargetFile = resolve(monorepoRoot, projRoot, 'node_modules', toolBin);
	const globalTargetFile = join(globalNodeModules, toolBin);
	const rigTargetFile = join(monorepoRoot, '@internal/local-rig', 'node_modules', toolBin);

	for (const file of [localTargetFile, globalTargetFile, rigTargetFile]) {
		if (existsSync(file)) {
			return file;
		}
	}

	const pkg = resolve(monorepoRoot, projRoot, 'package.json');

	logger.error`无法为子项目 long<${pkg}> 找到工具 ${tool} 的可执行文件`;
	logger.info` * ${localTargetFile}`;
	logger.info` * ${globalTargetFile}`;
	logger.info` * ${rigTargetFile}`;

	shutdown(1);
}
