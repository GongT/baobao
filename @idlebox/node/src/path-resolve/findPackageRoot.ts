import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { findUpUntilSync } from './findUp.js';

export function findPackageRoot(packageName: string, require = createRequire(process.cwd())) {
	try {
		return dirname(require.resolve(`${packageName}package.json`));
	} catch (e: any) {
		if (e.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
			const main = require.resolve(packageName);
			const pkgJson = findUpUntilSync({ from: main, file: 'package.json' });
			if (!pkgJson) {
				throw new Error(`Package ${packageName} do not have a package.json`);
			}
			return dirname(pkgJson);
		}
		throw e;
	}
}
