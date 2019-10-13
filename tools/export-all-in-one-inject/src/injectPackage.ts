import { isBuildConfigFileExists, setProjectDir } from '@idlebox/build-script';
import { createIgnore } from './actions/createIgnore';
import { updatePackageJson } from './actions/updatePackageJson';
import { PROJECT_ROOT } from './inc/argParse';

export default async function () {
	setProjectDir(PROJECT_ROOT);
	console.log('current directory:', PROJECT_ROOT);
	const hookMode = await isBuildConfigFileExists();
	await updatePackageJson(hookMode);
	await createIgnore();
	console.log('Done.');
}
