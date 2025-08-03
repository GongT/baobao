import { logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { dirname } from 'node:path';

export const initialWorkingDirectory = process.cwd();

const wr = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: initialWorkingDirectory });
if (!wr) {
	throw logger.fatal(`Could not find pnpm workspace root from working directory.`);
}

export const workspaceRoot: string = dirname(wr);

export const currentPackagePath = findUpUntilSync({
	file: 'package.json',
	from: initialWorkingDirectory,
	top: workspaceRoot,
});

const cpd = findUpUntilSync({ file: 'package.json', from: import.meta.dirname });
if (!cpd) {
	throw logger.fatal(`Could not find package.json from ${import.meta.dirname}`);
}
export const selfRootDir = dirname(cpd);
