import { createRootLogger, logger } from '@idlebox/logger';
import { execa } from 'execa';
import { resolve } from 'node:path';
import { monorepoRoot } from './common/constants.js';
import { listPnpm } from './common/monorepo.js';

createRootLogger('check');

const list = await listPnpm();
logger.log`checking ${list.length} packages...`;

const checkerScript = resolve(monorepoRoot, '@internal/scripts/loader/project-lint.js');

for (const { path } of list) {
	if (path === monorepoRoot || path.includes('@internal')) continue;

	logger.debug`checking package at ${path}...`;
	await execa(checkerScript, [], {
		stdin: 'ignore',
		stdout: 'inherit',
		stderr: 'inherit',
		cwd: path,
		node: true,
	});
}

logger.success`All packages checked successfully!`;
