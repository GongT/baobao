import { createWorkspace } from '@build-script/monorepo-lib';
import { argv, CommandDefine } from '@idlebox/cli';
import { isJsonOutput, isVerbose, pArgS } from '../common/functions/cli.js';

export class Command extends CommandDefine {
	protected override readonly _usage = `${pArgS('--verbose')} ${pArgS('--json')} ${pArgS('--relative')}`;
	protected override readonly _description = '列出所有项目目录';
	protected override readonly _help = '';
	protected override readonly _arguments = {
		'--verbose': { flag: true, description: '列出所有信息，而不仅是目录' },
		'--json': { flag: true, description: '输出json（同时使--verbose和--relative无效）' },
		'--relative': { flag: true, description: '输出相对路径（相对于monorepo根目录）' },
	};
}

export async function main() {
	const repo = await createWorkspace();
	const list = await repo.listPackages();

	const isRelative = argv.flag(['--relative']) > 0;

	if (isJsonOutput) {
		console.log(
			JSON.stringify(
				list.map((e) => {
					const { packageJson, ...extras } = e;
					return extras;
				}),
			),
		);
		return;
	}

	for (const item of list) {
		if (isVerbose) {
			console.log('name: %s', item.name);
			console.log('path: %s', item.absolute);
			console.log('relative: %s', item.relative);
			console.log('dependOn: %s', item.dependencies.join(', '));
			console.log('');
		} else if (isRelative) {
			console.log(item.relative);
		} else {
			console.log(item.absolute);
		}
	}
}
