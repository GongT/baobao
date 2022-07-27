import { resolve } from 'path';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { writeJsonFile } from '@idlebox/node-json-edit';
import {
	CONFIG_FILE,
	EXPORT_TEMP_PATH,
	INDEX_FILE_NAME,
	PKG_CONFIG_FILE,
	PROJECT_ROOT,
	TEMP_DIST_DIR_NAME,
	TEMP_SOURCE_DIR_NAME,
} from '../inc/argParse';
import { getOptions } from '../inc/configFile';

export async function createTempTSConfig() {
	const { options } = getOptions(CONFIG_FILE);
	const configFile = resolve(EXPORT_TEMP_PATH, 'tsconfig.json');

	await ensureLinkTarget(resolve(PROJECT_ROOT, 'package.json'), PKG_CONFIG_FILE);

	await writeJsonFile(configFile, {
		extends: CONFIG_FILE,
		compilerOptions: {
			removeComments: false,
			declaration: true,
			declarationMap: true,
			sourceMap: true,
			// module: 'esnext',
			noEmit: false,
			emitDeclarationOnly: false,
			outDir: TEMP_DIST_DIR_NAME,
			rootDir: TEMP_SOURCE_DIR_NAME,
			noUnusedLocals: false,
			strict: false,
			alwaysStrict: false,
			stripInternal: true,
			typeRoots: options.typeRoots,
		},
		exclude: [],
		include: [],
		files: [TEMP_SOURCE_DIR_NAME + '/' + INDEX_FILE_NAME + '.ts'],
	});
}
