import { argv } from '@idlebox/args/default';
import { promiseBool } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { execa } from 'execa';
import { resolve } from 'node:path';
import { listPnpm } from './common/monorepo.js';
import { monorepoRoot } from './common/paths/root.js';

const debug = argv.flag(['--debug', '-d']);
createRootLogger('check', debug > 1 ? EnableLogLevel.verbose : debug > 0 ? EnableLogLevel.debug : EnableLogLevel.auto);

const list = await listPnpm();
logger.log`checking ${list.length} packages...`;

const checkerScript = resolve(monorepoRoot, '@internal/scripts/loader/project-lint.js');

let errors = 0;
for (const { path } of list) {
	if (path === monorepoRoot || path.includes('@internal')) continue;

	logger.debug`checking package at ${path}...`;

	const args: string[] = [];
	if (debug > 0) {
		args.push(`-${'d'.repeat(debug)}`);
	}

	const promise = execa(checkerScript, args, {
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
