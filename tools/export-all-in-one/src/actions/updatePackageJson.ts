import { insertKeyAlphabet, loadJsonFile, writeJsonFile } from '@idlebox/node-json-edit';
import { resolve } from 'path';
import { ModuleKind } from 'typescript';
import { CONFIG_FILE, PROJECT_ROOT } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { relativePosix } from '../inc/paths';
import { registerPlugin } from '@idlebox/build-script';

export async function updatePackageJson(hookMode: boolean) {
	const configRel = relativePosix(PROJECT_ROOT, CONFIG_FILE);

	const command = getOptions();
	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));

	if (!packageJson.main) {
		insertKeyAlphabet(packageJson, 'main', 'lib/_export_all_in_once_index.js');
	}

	if (!packageJson.typings) {
		insertKeyAlphabet(packageJson, 'typings', 'docs/package-public.d.ts');
	}

	if (!packageJson.devDependencies) {
		insertKeyAlphabet(packageJson, 'devDependencies', {});
	}
	if (!packageJson.devDependencies['@idlebox/export-all-in-one']) {
		const v = require(resolve(__dirname, '../../package.json')).version;
		insertKeyAlphabet(packageJson.devDependencies, '@idlebox/export-all-in-one', '^' + v);
	}

	if (command.options.module === ModuleKind.ESNext) {
		if (!packageJson.module) {
			insertKeyAlphabet(packageJson, 'module', 'lib/_export_all_in_once_index.js');
		}
	}

	if (hookMode) {
		registerPlugin(PROJECT_ROOT, '@idlebox/export-all-in-one/build-script-register');
	} else {
		if (!packageJson.scripts) {
			insertKeyAlphabet(packageJson, 'scripts', {});
		}
		if (!packageJson.scripts['build:export-all-in-one']) {
			insertKeyAlphabet(packageJson.scripts, 'postbuild:export-all-in-one', 'export-all-in-one ' + configRel);
		}
	}

	await writeJsonFile(resolve(PROJECT_ROOT, 'package.json'), packageJson);
}
