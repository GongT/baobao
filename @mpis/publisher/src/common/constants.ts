import { findMonorepoRootSync } from '@build-script/find-monorepo-root';
import { argv } from '@idlebox/args/default';
import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { emptyDir, findUpUntilSync } from '@idlebox/node';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const wd = process.cwd();

const packagePath = findUpUntilSync({ file: 'package.json', from: wd });
if (!packagePath) {
	console.error('No package.json found in the current directory.');
	process.exit(1);
}
export const projectPath = dirname(packagePath);

const gitDir = findUpUntilSync({ file: '.git', from: projectPath });
if (!gitDir) {
	console.error('No repo root found.');
	process.exit(1);
}
export const repoRoot = dirname(gitDir);
export const isMonoRepo = !!findMonorepoRootSync(projectPath, gitDir);

export const debugMode = argv.flag(['--debug', '-d']) > 0;

export async function createTempFolder() {
	const tempFolder = `${projectPath}/.publisher`;
	await emptyDir(tempFolder);

	if (debugMode) {
		logger.verbose`temporary folder created at ${tempFolder}`;
	} else {
		registerGlobalLifecycle(
			toDisposable(() => {
				logger.verbose`Cleaning up temporary folder.`;
				rmSync(tempFolder, { recursive: true, force: true });
			}),
		);
	}
	tempDir = tempFolder;
}

export let tempDir: string;

export function getDecompressed() {
	return resolve(tempDir, 'package');
}
