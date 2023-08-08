import { getFormatInfo, loadJsonFile, reformatJson, stringifyJsonText, writeJsonFile } from '@idlebox/node-json-edit';
import { reformatPackageJson } from '../common/packageJson';

export async function formatPackageJson(file: string, args: string[]) {
	const pkg = await loadJsonFile(file);
	const format = getFormatInfo(pkg);
	const data = reformatPackageJson(pkg);
	reformatJson(data, format);

	const i = args.includes('-i');
	if (i) {
		args = args.filter((e) => e !== '-i');
	}
	if (args.length) {
		console.error('invalid arguments: %s', args);
		process.exit(1);
	}

	if (i) {
		const change = await writeJsonFile(file, data, 'utf-8');
		if (change) {
			console.log('format:', file);
		}
	} else {
		console.log(await stringifyJsonText(data));
	}
}
