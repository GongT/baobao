import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { resolve } from 'path';

export default async function (path: string, name: string) {
	const json: any = await loadJsonFile(resolve(path, 'build-script.json'));
	if (!json.plugins.includes(name)) {
		json.plugins.push(name);
		await writeJsonFileBack(json);
	}
}
