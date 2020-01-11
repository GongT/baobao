import { getPlugin, registerPlugin } from '@idlebox/build-script';
import { getFormatInfo, insertKeyAlphabet, loadJsonFile, reformatJson, writeJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { getPackageManager } from '@idlebox/package-manager/lib/common/getPackageManager';
import { lrelative } from '@idlebox/platform';
import { dirname, resolve } from 'path';
import { ModuleKind } from 'typescript';
import { CONFIG_FILE, PROJECT_ROOT } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { relativePosix } from '../inc/paths';

export async function updatePackageJson(hookMode: boolean) {
	const configRel = relativePosix(PROJECT_ROOT, CONFIG_FILE);

	const command = getOptions();

	if (!command.options.outDir) {
		throw new Error(`Oops, this project did not have "outDir" in "compilerOptions" in "${CONFIG_FILE}"`);
	}

	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));

	if (!packageJson.exports) {
		packageJson.exports = {};
	}
	if (!packageJson.exports['./']) {
		packageJson.exports['./'] = './private-path-not-exists';
	}

	insertKeyAlphabet(packageJson, 'typings', 'docs/package-public.d.ts');

	let mustEndWith = '';
	if (command.options.module === ModuleKind.ESNext) {
		console.log('set module file is lib/esm/_export_all_in_one_index.js');
		insertKeyAlphabet(packageJson, 'module', 'lib/esm/_export_all_in_one_index.js');
		mustEndWith = 'esm';
	} else {
		console.log('set main file is lib/cjs/_export_all_in_one_index.js');
		insertKeyAlphabet(packageJson, 'main', 'lib/cjs/_export_all_in_one_index.js');
		mustEndWith = 'cjs';
	}

	if (!command.options.outDir.endsWith('/' + mustEndWith) && !command.options.outDir.endsWith('\\' + mustEndWith)) {
		const updateTo = lrelative(dirname(CONFIG_FILE), command.options.outDir) + '/' + mustEndWith;
		console.warn('warning: updating outDir=%s in tsconfig! file: %s.', updateTo, CONFIG_FILE);
		const configRaw = await loadJsonFile(CONFIG_FILE);
		configRaw.compilerOptions.outDir = updateTo;
		await writeJsonFileBack(configRaw);
	}

	if (hookMode) {
		const myFile = '@idlebox/export-all-in-one/build-script-register';
		const previous = (await getPlugin(myFile)) || [];
		await registerPlugin(myFile, [...previous, configRel].filter(uniq));
	} else {
		if (!packageJson.scripts) {
			insertKeyAlphabet(packageJson, 'scripts', {});
		}
		if (!packageJson.scripts['build:export-all-in-one']) {
			insertKeyAlphabet(packageJson.scripts, 'export-all-in-one', 'export-all-in-one ' + configRel);
		}
	}

	await writeJsonFile(resolve(PROJECT_ROOT, 'package.json'), packageJson);

	if (!packageJson.devDependencies || !packageJson.devDependencies['@idlebox/export-all-in-one']) {
		const oldFormat = getFormatInfo(await loadJsonFile(resolve(PROJECT_ROOT, 'package.json')))!;

		const pm = await getPackageManager({ cwd: PROJECT_ROOT });
		await pm.install('--dev', '@idlebox/export-all-in-one');

		const packageJson = require(resolve(PROJECT_ROOT, 'package.json'));
		reformatJson(packageJson, oldFormat);
		await writeJsonFile(resolve(PROJECT_ROOT, 'package.json'), packageJson);
	}
}

function uniq(item: string, index: number, self: string[]) {
	return index === self.lastIndexOf(item);
}
