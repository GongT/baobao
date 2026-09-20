import { getFormatInfo, reformatJson } from '@idlebox/json-edit';
import { reformatPackageJson } from '../common/packageJson.js';

export async function formatPackageJsonObject(pkg: any) {
	const format = getFormatInfo(pkg);
	const data = reformatPackageJson(pkg);
	reformatJson(data, format);
	return data;
}
