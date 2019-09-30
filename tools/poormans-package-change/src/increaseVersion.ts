import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { inc } from 'semver';
import { log } from './log';

export async function increaseVersion(packageFile: string) {
	const pkg = await loadJsonFile(packageFile);
	pkg.version = inc(pkg.version, 'patch');
	log('new version: %s', pkg.version);
	await writeJsonFileBack(pkg);
	log('package.json write back complete.');
}
