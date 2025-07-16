import type { IPackageJson } from '@idlebox/common';

export async function importPackageJson(file: string): Promise<IPackageJson> {
	const pkg = await import(file, { with: { type: 'json' } });
	return pkg.default;
}
