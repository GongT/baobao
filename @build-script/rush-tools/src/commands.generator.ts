import type { FileBuilder, IOutputShim } from '@build-script/heft-codegen-plugin';
import { readdir } from 'fs/promises';

export async function generate(build: FileBuilder, logger: IOutputShim) {
	readdir(path)
}
