import { argv } from '@idlebox/args/default';
import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { emptyDir, findUpUntilSync } from '@idlebox/node';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export let packagePath: string;

const pkg = findUpUntilSync({ file: 'package.json', from: process.cwd() });
if (!pkg) {
	console.error('No package.json found in the current directory.');
	process.exit(1);
}
packagePath = pkg;

export const projectPath = dirname(packagePath);

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
