import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';

export const initialWorkingDirectory = process.cwd();

const workspace = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: initialWorkingDirectory });
if (!workspace) {
	console.error('initialWorkingDirectory = %s', initialWorkingDirectory);
	throw new Error('找不到 pnpm-workspace.yaml');
}

const pkgJson = findUpUntilSync({ file: 'package.json', from: import.meta.dirname });
if (!pkgJson) {
	console.error('import.meta.dirname = %s', import.meta.dirname);
	throw new Error('找不到 package.json');
}
export const internalScriptsRoot = dirname(pkgJson);

export const monorepoRoot = dirname(workspace);
export const cacheDir = resolve(monorepoRoot, 'node_modules/temp');
export const globalNodeModules = resolve(monorepoRoot, 'node_modules');
