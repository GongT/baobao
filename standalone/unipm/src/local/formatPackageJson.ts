import { getFormatInfo, loadJsonFile, reformatJson, stringifyJsonText, writeJsonFile } from '@idlebox/node-json-edit';
import { reformatPackageJson } from '../common/packageJson';

export async function formatPackageJson(file: string, args: string[]) {
	const pkg = await loadJsonFile(file);
	const format = getFormatInfo(pkg);
	const data = reformatPackageJson(pkg);
	reformatJson(data, format);

	if (args.includes('-i')) {
		const change = await writeJsonFile(file, data, 'utf-8');
		if (change) {
			console.log('format:', file);
		}
	} else {
		console.log(stringifyJsonText(data));
	}
}
