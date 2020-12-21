import { createRequire } from 'module';
import { dirname } from 'path';
import { findUpUntilSync } from './findUp';

export function findPackageRoot(packageName: string, require = createRequire(process.cwd())) {
	try {
		return dirname(require.resolve(packageName + 'package.json'));
	} catch (e) {
		if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
			const main = require.resolve(packageName);
			const pkgJson = findUpUntilSync(main, 'package.json');
			if (!pkgJson) {
				throw new Error(`Package ${packageName} do not have a package.json`);
			}
			return dirname(pkgJson);
		} else {
			throw e;
		}
	}
}
