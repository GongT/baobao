import { escapeRegExp } from '@idlebox/common';
import { shutdown } from '@idlebox/node';
import { execa } from 'execa';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { monorepoRoot } from './common/paths/root.js';

const gitClean = await execa({
	cwd: monorepoRoot,
	stdio: ['ignore', 'pipe', 'inherit'],
	encoding: 'utf8',
})`git clean -ndX`;

const correctLine = /^Would remove /;
const ignores = ['node_modules', '.vscode'];
const ignoreReg = new RegExp(
	`(${ignores
		.map(escapeRegExp)
		.map((e) => {
			return `(?:^|/)${e}(?:/|$)`;
		})
		.join('|')})`,
);

for (const line of gitClean.stdout.split('\n')) {
	if (!correctLine.test(line)) continue;

	const rel = line.replace(correctLine, '').trim();
	const path = resolve(monorepoRoot, rel);

	if (ignoreReg.test(path)) {
		logger.verbose`ignores long<${rel}>`;
		continue;
	}

	logger.log`deleting long<${rel}>`;
	rmSync(path, { recursive: true, force: true });
}

logger.success`clean complete`;
shutdown(0);
