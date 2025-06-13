import { findUpUntilSync } from '@idlebox/node';
import { dirname } from 'node:path';

export const initialWorkingDirectory = process.cwd();

const pkg = findUpUntilSync({ file: 'package.json', from: initialWorkingDirectory });
if (!pkg) {
	throw new Error('找不到临时包的 package.json');
}
export const packagePath = pkg;
export const projectPath = dirname(packagePath);

const workspace = findUpUntilSync({ file: 'pnpm-workspace.yaml', from: initialWorkingDirectory });
if (!workspace) {
	throw new Error('找不到 pnpm-workspace.yaml');
}
export const monorepoRoot = dirname(workspace);

export const lifecycleEventName = process.env.lifecycle_event;
if(!lifecycleEventName){
	throw new Error('脚本仅通过 @mpis/publisher 调用.');
}
export const isPublish = lifecycleEventName === 'publish';
