import { insertKeyAlphabet, loadJsonFile, writeJsonFile } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { ModuleKind } from 'typescript';
import { PROJECT_ROOT } from './argParse';
import { getOptions } from './configFile';

export async function updatePackageJson() {
	const command = getOptions();
	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));

	if (!packageJson.main) {
		insertKeyAlphabet(packageJson, 'main', 'lib/_export_all_in_once_index.js');
	}

	if (!packageJson.typings) {
		insertKeyAlphabet(packageJson, 'typings', 'docs/package-public.d.ts');
	}

	if (command.options.module === ModuleKind.ESNext) {
		if (!packageJson.module) {
			insertKeyAlphabet(packageJson, 'module', 'lib/_export_all_in_once_index.js');
		}
	}

	await writeJsonFile(resolve(PROJECT_ROOT, 'package.json'), packageJson);
}
