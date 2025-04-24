import { argv, formatOptions, isJsonOutput, isVerbose, pArgS, pDesc } from '../common/functions/cli.js';
import { createWorkspace } from '../common/workspace/workspace.js';

export function usageString() {
	return `${pArgS('--verbose')} ${pArgS('--json')} ${pArgS('--relative')} ${pDesc('列出所有项目目录')}`;
}
const args = {
	'--verbose': '列出所有信息，而不仅是目录',
	'--json': '输出json（不受--verbose和--name影响）',
	'--relative': '输出相对路径（相对于monorepo根目录）',
};
export function helpString() {
	return formatOptions(args);
}

export async function main() {
	const repo = await createWorkspace();
	const list = await repo.listPackages();

	const isRelative = argv.flag('--relative') > 0;

	if (isJsonOutput) {
		console.log(
			JSON.stringify(
				list.map((e) => {
					const { packageJson, ...extras } = e;
					return extras;
				})
			)
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
