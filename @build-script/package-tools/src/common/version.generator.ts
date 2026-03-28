import type { FileBuilder, IOutputShim } from '@build-script/codegen';
import { execa } from 'execa';
import * as fs from 'node:fs';
import * as path from 'node:path';

export async function generate(_builder: FileBuilder, logger: IOutputShim) {
	const pkgFile = path.resolve(import.meta.dirname, '../../package.json');
	const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));

	logger.log(`package info = ${pkg.name} @ ${pkg.version}`);

	const { stdout } = await execa('git', ['remote', 'get-url', 'origin']);
	const repository = stdout.trim().replace(/\.git$/, '');

	return `export const self_package_version = "${pkg.version}";
export const self_package_name = "${pkg.name}";
export const self_package_repository = "${repository}";
`;
}
