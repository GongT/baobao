import { isBuildConfigFileExists } from '@idlebox/build-script';
import { updatePackageJson } from './actions/updatePackageJson';
import { PROJECT_ROOT } from './inc/argParse';

export default async function () {
	const hookMode = await isBuildConfigFileExists(PROJECT_ROOT);
	await updatePackageJson(hookMode);
}
