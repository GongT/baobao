import { createRequire } from 'module';

/**
 * get absolute js file location by using node's require
 * @param packageJsonFilePath resolve start point
 * @param file  relative file to resolve
 */
export function resolveModuleNative(packageJsonFilePath: string, file: string = '.'): string | null {
	if (file === '.') {
		const require = createRequire(packageJsonFilePath);
		try {
			return require.resolve(file);
		} catch (e) {}
	}
	return null;
}
