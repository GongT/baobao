import { findUpUntilSync } from '@idlebox/node';
import { dirname } from 'node:path';
import { initialWorkingDirectory } from './root.js';

const pkg = findUpUntilSync({ file: 'package.json', from: initialWorkingDirectory });
if (!pkg) {
	console.error('initialWorkingDirectory = %s', initialWorkingDirectory);
	throw new Error('找不到当前包的 package.json，当前命令需要在包内执行');
}
export const currentProject = dirname(pkg);

export let realProject: string;
const realPkg = findUpUntilSync({ file: 'package.json', from: dirname(currentProject) });
if (realPkg) {
	realProject = dirname(realPkg);
} else {
	realProject = currentProject;
}
