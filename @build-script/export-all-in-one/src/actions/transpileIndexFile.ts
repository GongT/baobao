import { writeFile, access, copyFile, readdir } from 'fs-extra';
import { resolve } from 'path';
import { EXPORT_TEMP_PATH, INDEX_FILE_NAME, SOURCE_ROOT, TEMP_DIST_DIR_NAME } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { debug } from '../inc/debug';

const ignored = /\.d\.ts(?:\.map)?$/i;

export async function transpileIndexFile() {
	console.log('\x1B[38;5;10mcreate index file(s).\x1B[0m');
	const originalOptions = getOptions().options;

	const copyFrom = resolve(EXPORT_TEMP_PATH, TEMP_DIST_DIR_NAME);
	const saveTo = originalOptions.outDir || SOURCE_ROOT;
	for (const item of await readdir(copyFrom)) {
		if (item.startsWith(INDEX_FILE_NAME) && !ignored.test(item)) {
			debug(' - copy %s', item);
			await copyFile(resolve(copyFrom, item), resolve(saveTo, item));
		}
	}

	const cjsWrapper = resolve(saveTo, `${INDEX_FILE_NAME}.cjs`);
	try {
		await access(cjsWrapper);
	} catch {
		debug(' - create cjs wrapper with @gongt/fix-esm');
		const data = `module.exports = require('@gongt/fix-esm').require('./${INDEX_FILE_NAME}.js')`;
		await writeFile(cjsWrapper, data);
	}
}
