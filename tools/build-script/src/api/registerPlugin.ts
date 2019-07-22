import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { fancyLog } from '../inc/fancyLog';
import { IBuildScriptJson } from './types';

export default async function (path: string, name: string, args?: string[]) {
	const json: IBuildScriptJson = await loadJsonFile(resolve(path, 'build-script.json'));
	const index = json.plugins.findIndex(item => item.name === name);
	if (index !== -1) {
		fancyLog('build-script: update plugin: %s', name);
		json.plugins[index].args = args;
	} else {
		fancyLog('build-script: add plugin: %s', name);
		json.plugins.push({ name, args });
	}
	await writeJsonFileBack(json);
}
