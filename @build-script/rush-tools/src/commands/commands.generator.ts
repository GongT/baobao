import type { FileBuilder, IOutputShim } from '@build-script/heft-codegen-plugin';
import { readdir, stat } from 'fs/promises';
import { resolve } from 'path';

export async function generate(build: FileBuilder, logger: IOutputShim) {
	const dir = import.meta.dirname;
	const files = await readdir(dir);
	for (const file of files) {
		const ss = await stat(resolve(dir, file));
		if (!ss.isDirectory()) continue;

		build.append(`export {command as ${JSON.stringify(file)}} from "./${file}/arguments.js"`);
	}
}
