import { sort } from 'semver';
import { log } from '../inc/log';
import { getNpmCache } from './native.npm';
import { getPnpmCache } from './native.pnpm';
import { getYarnCache } from './native.yarn';

export async function getLatestVersionFromCache(
	packageName: string,
	distTag: string,
	packagePath: string,
	registry: string
): Promise<string> {
	log('[cache] %s:', packageName);
	let versions: string[] = [];
	if (distTag === 'latest') {
		versions.push(...(await getPnpmCache(packageName, packagePath)));
		versions.push(...(await getYarnCache(packageName)));
	}

	versions.push(...(await getNpmCache(packageName, distTag, registry)));
	if (versions.length > 0) {
		log('[cache] %s', versions.join(', '));
		sort(versions);
		return versions.pop()!;
	} else {
		log('[cache] empty');
		return '';
	}
}
