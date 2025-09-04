import { findUpUntilSync } from '@idlebox/node';
import { dirname, resolve } from 'node:path';

export const initialWorkingDirectory = process.cwd();

const pkg = findUpUntilSync({ file: 'package.json', from: initialWorkingDirectory });
if (!pkg) {
	console.error('initialWorkingDirectory = %s', initialWorkingDirectory);
	throw new Error('找不到临时包的 package.json');
}
export const currentProject = dirname(pkg);

export let realProject: string;
const realPkg = findUpUntilSync({ file: 'package.json', from: dirname(currentProject) });
if (realPkg) {
	realProject = dirname(realPkg);
} else {
	realProject = currentProject;
}

const workspace = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: realProject });
if (!workspace) {
	console.error('initialWorkingDirectory = %s', initialWorkingDirectory);
	throw new Error('找不到 pnpm-workspace.yaml');
}
export const monorepoRoot = dirname(workspace);

if (realProject === monorepoRoot) {
	realProject = currentProject;
}

export const cacheDir = resolve(monorepoRoot, 'node_modules/temp');
export const globalNodeModules = resolve(monorepoRoot, 'node_modules');
