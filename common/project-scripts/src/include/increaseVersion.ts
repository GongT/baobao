import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { inc } from 'semver';

export async function increaseVersion(packageFile: string) {
	const pkg = await loadJsonFile(packageFile);
	pkg.version = inc(pkg.version, 'patch');
	await writeJsonFileBack(pkg);
	console.log('    update version = %s', pkg.version);
}
