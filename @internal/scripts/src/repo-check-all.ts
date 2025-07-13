import { promiseBool } from '@idlebox/common';
import { createRootLogger, logger } from '@idlebox/logger';
import { execa } from 'execa';
import { resolve } from 'node:path';
import { monorepoRoot } from './common/constants.js';
import { listPnpm } from './common/monorepo.js';

createRootLogger('check');

const list = await listPnpm();
logger.log`checking ${list.length} packages...`;

const checkerScript = resolve(monorepoRoot, '@internal/scripts/loader/project-lint.js');

let errors = 0;
for (const { path } of list) {
	if (path === monorepoRoot || path.includes('@internal')) continue;

	logger.debug`checking package at ${path}...`;
	const promise = execa(checkerScript, [], {
		stdin: 'ignore',
		stdout: 'inherit',
		stderr: 'inherit',
		cwd: path,
		node: true,
	});

	const ok = await promiseBool(promise);

	if (!ok) {
		errors += 1;
	}
}

if (errors) {
	logger.fatal`${errors} 个包存在问题`;
} else {
	logger.success`所有包检查通过！`;
}
