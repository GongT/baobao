import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { inc } from 'semver';
import { log } from '../inc/log';

export async function increaseVersion(packageFile: string, current: string) {
	const pkg = await loadJsonFile(packageFile);
	pkg.version = inc(current, 'patch');
	log('new version: %s', pkg.version);
	await writeJsonFileBack(pkg);
	log('package.json write back complete.');
}
