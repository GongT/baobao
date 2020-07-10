import { posix, resolve } from 'path';
import { getPlugin, registerPlugin } from '@build-script/builder';
import {
	getFormatInfo,
	insertKeyAlphabet,
	loadJsonFile,
	reformatJson,
	writeJsonFileBack,
} from '@idlebox/node-json-edit';
import { getPackageManager } from 'unipm';
import { CONFIG_FILE, NO_DUAL_FLAG, PROJECT_ROOT } from '../inc/argParse';
import { INDEX_FILE_NAME, relativePosix } from '../inc/paths';

interface IOptions {
	hookMode: boolean;
	dualPackage: boolean;
	isESNext: boolean;
	outDir: string;
}
export async function updatePackageJson({ isESNext, hookMode, dualPackage, outDir }: IOptions) {
	const configRel = relativePosix(PROJECT_ROOT, CONFIG_FILE);

	const packageJson = await loadJsonFile(resolve(PROJECT_ROOT, 'package.json'));
	const relOut = './' + posix.relative(PROJECT_ROOT, outDir + '/' + INDEX_FILE_NAME);

	if (isESNext) {
		insertKeyAlphabet(packageJson, 'type', 'module');
		if (dualPackage) {
			console.log('inserting dual package.');
			insertKeyAlphabet(packageJson, 'main', relOut + '.cjs');
			insertKeyAlphabet(packageJson, 'module', relOut + '.js');
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
		const myFile = '@build-script/export-all-in-one/build-script-register';
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

	if (!packageJson.devDependencies || !packageJson.devDependencies['@build-script/export-all-in-one']) {
		const oldFormat = getFormatInfo(await loadJsonFile(resolve(PROJECT_ROOT, 'package.json')))!;

		const pm = await getPackageManager({ cwd: PROJECT_ROOT });
		await pm.install('--dev', '@build-script/export-all-in-one');

		const packageJson = require(resolve(PROJECT_ROOT, 'package.json'));
		reformatJson(packageJson, oldFormat);
	}

	await writeJsonFileBack(packageJson);
}

function uniqNotEmpty(item: string, index: number, self: string[]) {
	return item && index === self.lastIndexOf(item);
}
