import type { IPackageJson } from '@idlebox/common';

export async function importPackageJson(file: string): Promise<IPackageJson> {
	try {
		const pkg = await import(file, { with: { type: 'json' } });
		return pkg.default;
	} catch (e: any) {
		if (e.code !== 'ERR_MODULE_NOT_FOUND') {
			throw e;
		}

		const ee = new Error('No such file: ' + file);
		Object.assign(ee, { code: 'ENOENT' });
		Error.captureStackTrace(ee, importPackageJson);
		throw ee;
	}
}
