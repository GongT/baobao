import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';

export const initialWorkingDirectory = process.cwd();

const workspace = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: initialWorkingDirectory });
if (!workspace) {
	console.error('initialWorkingDirectory = %s', initialWorkingDirectory);
	throw new Error('找不到 pnpm-workspace.yaml');
}
export const monorepoRoot = dirname(workspace);
export const cacheDir = resolve(monorepoRoot, 'node_modules/temp');
export const globalNodeModules = resolve(monorepoRoot, 'node_modules');
