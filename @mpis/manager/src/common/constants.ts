import { logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';

export const initialWorkingDirectory = process.cwd();

const wr = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: initialWorkingDirectory });
if (!wr) {
	throw logger.fatal(`Could not find pnpm workspace root from working directory.`);
}

export const workspaceRoot: string = wr;

export const currentPackagePath = findUpUntilSync({
	file: 'package.json',
	from: initialWorkingDirectory,
	top: workspaceRoot,
});
