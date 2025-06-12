import type { FileBuilder, IOutputShim } from '@build-script/heft-plugin-base';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function generate(builder: FileBuilder, logger: IOutputShim) {
	const pkgFile = path.resolve(__dirname, '../../package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));

	logger.log('package info = %s @ %s', pkg.name, pkg.version);

	return `export const self_package_version = "${pkg.version}";
export const self_package_name = "${pkg.name}";
export const self_package_repository = "${pkg.repository}";
`;
}
