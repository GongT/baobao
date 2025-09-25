import { findUpUntilSync } from '@idlebox/node';
import { dirname } from 'node:path';

const packageRootFile = findUpUntilSync({ file: 'package.json', from: process.cwd() });
if (!packageRootFile) {
	throw new Error('无法找到当前包的根目录');
}
export const packageRoot = dirname(packageRootFile);

const projectRootFile = findUpUntilSync({ file: 'pnpm-lock.yaml', from: packageRoot });
if (!projectRootFile) {
	throw new Error('无法找到项目根目录');
}
export const projectRoot = dirname(projectRootFile);
