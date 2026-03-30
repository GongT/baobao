import { arrayChunk } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { execa } from 'execa';
import { monorepoRoot } from './common/paths/root.js';

createRootLogger('pre-commit', EnableLogLevel.verbose);

const $x = execa({
	cwd: monorepoRoot,
	stdio: 'inherit',
	verbose: 'short',
});
const $ = execa({
	cwd: monorepoRoot,
	stdio: ['ignore', 'pipe', 'inherit'],
});

const cachedFiles = (await $`git diff --cached --name-only --diff-filter=ACMR`).stdout.split('\n');
const changedFiles = (await $`git diff --name-only --diff-filter=ACMR`).stdout.split('\n');

for (const file of cachedFiles) {
	if (changedFiles.includes(file)) {
		logger.error`文件 ${file} 同时存在 staged 和 unstaged 的修改，无法提交`;
		shutdown(1);
	}
}

if (cachedFiles.some(isPackageJson)) {
	logger.info`⌛ 发现包更改，强制更新 pnpm-lock.yaml`;
	await $x`pnpm i --lockfile-only`;
	await $x`git add pnpm-lock.yaml`;
}

const jsFileReg = /\.([tj]sx?|[mc][tj]s|jsonc?)$/i;
const jsFiles = cachedFiles.filter((file) => jsFileReg.test(file));
const shFileReg = /\.(sh)$/i;
const shFiles = cachedFiles.filter((file) => shFileReg.test(file));

logger.info`⌛ 运行代码格式化工具`;
for (const chunk of arrayChunk(jsFiles, 10)) {
	await $`pnpm exec biome check --fix --unsafe ${chunk}`;
	await $`git add ${chunk}`;
}
for (const chunk of arrayChunk(shFiles, 10)) {
	await $`shfmt -w -s -ln bash ${chunk}`;
	await $`git add ${chunk}`;
}

logger.success`可以提交`;
shutdown(0);

function isPackageJson(file: string) {
	return file.endsWith('package.json') || file.endsWith('package.yaml') || file.endsWith('package.yml');
}
