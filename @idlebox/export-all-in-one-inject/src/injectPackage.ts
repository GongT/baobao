import { isBuildConfigFileExists, setProjectDir } from '@idlebox/build-script';
import { createIgnore } from './actions/createIgnore';
import { updatePackageJson, NO_DUAL_FLAG } from './actions/updatePackageJson';
import { PROJECT_ROOT, CONFIG_FILE } from './inc/argParse';
import { getOptions } from './inc/configFile';
import { ModuleKind } from 'typescript';

export default async function() {
	setProjectDir(PROJECT_ROOT);
	console.log('current directory:', PROJECT_ROOT);
	const hookMode = await isBuildConfigFileExists();

	const command = getOptions();

	const outDir = command.options.outDir;
	if (!outDir) {
		throw new Error(`Oops, this project did not have "outDir" in "compilerOptions" in "${CONFIG_FILE}"`);
	}

	const isESNext = command.options.module === ModuleKind.ESNext;

	const dualPackage = !process.argv.includes(NO_DUAL_FLAG);

	await updatePackageJson({ isESNext, hookMode, dualPackage, outDir });
	await createIgnore();
	console.log('Done.');
}
