import { registerPlugin } from '@idlebox/build-script';
import { insertKeyAlphabet, loadJsonFile, writeJsonFile } from '@idlebox/node-json-edit';
import { getPackageManager } from '@idlebox/package-manager';
import { resolve } from 'path';
import { ModuleKind } from 'typescript';
import { CONFIG_FILE, PROJECT_ROOT } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { relativePosix } from '../inc/paths';

export async function updatePackageJson(hookMode: boolean) {
	const configRel = relativePosix(PROJECT_ROOT, CONFIG_FILE);

	const command = getOptions();
	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));

	if (!packageJson.main) {
		insertKeyAlphabet(packageJson, 'main', 'lib/_export_all_in_one_index.js');
	}
	if (!packageJson.exports) {
		packageJson.exports = {};
	}
	if (!packageJson.exports['./']) {
		packageJson.exports['./'] = './private-path-not-exists';
	}

	if (!packageJson.typings) {
		insertKeyAlphabet(packageJson, 'typings', 'docs/package-public.d.ts');
	}

	if (!packageJson.devDependencies || !packageJson.devDependencies['@idlebox/export-all-in-one']) {
		const pm = await getPackageManager({ cwd: PROJECT_ROOT });
		await pm.install('--dev', '@idlebox/export-all-in-one');
	}

	if (command.options.module === ModuleKind.ESNext) {
		if (!packageJson.module) {
			insertKeyAlphabet(packageJson, 'module', 'lib/_export_all_in_one_index.js');
		}
	}

	if (hookMode) {
		await registerPlugin('@idlebox/export-all-in-one/build-script-register', [configRel]);
	} else {
		if (!packageJson.scripts) {
			insertKeyAlphabet(packageJson, 'scripts', {});
		}
		if (!packageJson.scripts['build:export-all-in-one']) {
			insertKeyAlphabet(packageJson.scripts, 'export-all-in-one', 'export-all-in-one ' + configRel);
		}
	}

	await writeJsonFile(resolve(PROJECT_ROOT, 'package.json'), packageJson);
}
