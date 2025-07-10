import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';

export const initialWorkingDirectory = process.cwd();

const pkg = findUpUntilSync({ file: 'package.json', from: initialWorkingDirectory });
if (!pkg) {
	throw new Error('找不到临时包的 package.json');
}
export const currentProject = dirname(pkg);

const workspace = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: currentProject });
if (!workspace) {
	throw new Error('找不到 pnpm-workspace.yaml');
}
export const monorepoRoot = dirname(workspace);

export const cacheDir = resolve(monorepoRoot, 'node_modules/temp');
export const globalNodeModules = resolve(monorepoRoot, 'node_modules');
