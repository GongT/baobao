import { getPlugin, registerPlugin } from '@idlebox/build-script';
import { getFormatInfo, insertKeyAlphabet, loadJsonFile, reformatJson, writeJsonFile } from '@idlebox/node-json-edit';
import { resolve, posix } from 'path';
import { getPackageManager } from '@idlebox/package-manager';
import { CONFIG_FILE, PROJECT_ROOT } from '../inc/argParse';
import { relativePosix } from '../inc/paths';

export const NO_DUAL_FLAG = '--no-dual-package';

interface IOptions {
	hookMode: boolean;
	dualPackage: boolean;
	isESNext: boolean;
	outDir: string;
}
export async function updatePackageJson({ isESNext, hookMode, dualPackage, outDir }: IOptions) {
	const configRel = relativePosix(PROJECT_ROOT, CONFIG_FILE);

	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));
	const relOut = './' + posix.relative(PROJECT_ROOT, outDir + '/_export_all_in_one_index');

	if (isESNext) {
		insertKeyAlphabet(packageJson, 'type', 'module');
		if (dualPackage) {
			insertKeyAlphabet(packageJson, 'main', relOut + '.cjs');
			if (!packageJson.exports) {
				insertKeyAlphabet(packageJson, 'exports', {});
			}
			if (!packageJson.exports['.']) {
				packageJson.exports['.'] = {};
			}
			packageJson.exports['.']['require'] = relOut + '.cjs';
			packageJson.exports['.']['import'] = relOut + '.js';
		} else {
			insertKeyAlphabet(packageJson, 'main', relOut + '.js');
		}
	} else {
		insertKeyAlphabet(packageJson, 'type', 'commonjs');
		insertKeyAlphabet(packageJson, 'main', relOut + '.js');
	}

	insertKeyAlphabet(packageJson, 'typings', 'docs/package-public.d.ts');

	if (hookMode) {
		const myFile = '@idlebox/export-all-in-one/build-script-register';
		const previous = (await getPlugin(myFile)) || [];
		await registerPlugin(myFile, [dualPackage ? '' : NO_DUAL_FLAG, ...previous, configRel].filter(uniqNotEmpty));
	} else {
		if (!packageJson.scripts) {
			insertKeyAlphabet(packageJson, 'scripts', {});
		}
		if (!packageJson.scripts['build:export-all-in-one']) {
			insertKeyAlphabet(
				packageJson.scripts,
				'export-all-in-one',
				'export-all-in-one ' + (dualPackage ? NO_DUAL_FLAG + ' ' : '') + configRel
			);
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

function uniqNotEmpty(item: string, index: number, self: string[]) {
	return item && index === self.lastIndexOf(item);
}
