import { createWorkspace } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { UsageError } from '@idlebox/common';
import { PackageManagerUsageKind } from '../common/package-manager/driver.abstract.js';
import { createPackageManager } from '../common/package-manager/package-manager.js';

export class Command extends CommandDefine {
	protected override readonly _usage = '运行pack命令';
	protected override readonly _description = '';
	protected override readonly _help = '';
	protected override readonly _arguments = {
		'--output': {
			flag: false,
			description: '输出文件路径',
		},
		'--project': {
			flag: false,
			description: '要打包的项目名称',
		},
	};
	public readonly isHidden = true;
}

export async function main() {
	const workspace = await createWorkspace();
	const projectName = argv.single(['--project']);
	if (!projectName) {
		throw new UsageError('missing --project');
	}

	const node = await workspace.getPackage(projectName);
	if (!node) {
		throw new UsageError(`unknown project: ${projectName}`);
	}

	const output = argv.single(['--output']);
	if (!output) {
		throw new UsageError(`missing --output`);
	}

	logger.log`unshare builder: ${node.name}`;
	const pm = await createPackageManager(PackageManagerUsageKind.Read, workspace, node.absolute);
	const realOut = await pm.pack(output);

	console.log(realOut);
}
