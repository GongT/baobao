import { formatOptions, isJsonOutput, isVerbose, pArgS, pDesc } from '../inc/getArg.js';
import { listMonoRepoPackages } from '../inc/mono-tools.js';

export function usageString() {
	return `${pArgS('--verbose')} ${pArgS('--json')} ${pDesc('列出所有项目目录（相对于monorepo根目录）')}`;
}
const args = {
	'--verbose': '列出所有信息，而不仅是目录',
};
export function helpString() {
	return formatOptions(args);
}

export async function main() {
	const list = await listMonoRepoPackages();

	if (isJsonOutput) {
		console.log(list);
		return;
	}

	for (const item of list) {
		if (isVerbose) {
			console.log('name: %s', item.name);
			console.log('path: %s', item.absolute);
			console.log('relative: %s', item.relative);
			console.log('dependOn: %s', item.dependencies.join(', '));
			console.log('');
		} else {
			console.log(item.absolute);
		}
	}
}
