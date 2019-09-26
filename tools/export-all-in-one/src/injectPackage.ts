import { isBuildConfigFileExists, setProjectDir } from '@idlebox/build-script';
import { updatePackageJson } from './actions/updatePackageJson';
import { PROJECT_ROOT } from './inc/argParse';

export default async function () {
	setProjectDir(PROJECT_ROOT);
	const hookMode = await isBuildConfigFileExists();
	await updatePackageJson(hookMode);
	console.log('Done.');
}
