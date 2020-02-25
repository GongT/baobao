import { writeJsonFile } from '@idlebox/node-json-edit';
import { ensureDir } from 'fs-extra';
import { dirname, resolve } from 'path';
import { CONFIG_FILE, EXPORT_TEMP_PATH } from '../inc/argParse';
import { getOptions } from '../inc/configFile';

interface IOpt {
	want: 'source' | 'declaration';
	type: string;
}
export async function createTempTSConfig({ want, type }: IOpt) {
	const { options } = getOptions(CONFIG_FILE);
	const configFile = resolve(EXPORT_TEMP_PATH, `tsconfig.${type}.json`);

	await ensureDir(dirname(configFile));
	await writeJsonFile(configFile, {
		extends: CONFIG_FILE,
		compilerOptions: {
			removeComments: false,
			declaration: want === 'declaration',
			declarationMap: want === 'declaration',
			sourceMap: want === 'source',
			module: 'esnext',
			noEmit: false,
			emitDeclarationOnly: want === 'declaration',
			noEmitOnError: false,
			outDir: `${want}-output`,
			rootDir: 'extracted-source',
			noUnusedLocals: false,
			strict: false,
			alwaysStrict: false,
			stripInternal: true,
			typeRoots: options.typeRoots,
		},
		exclude: [],
		include: ['extracted-source/**/*.ts', 'extracted-source/**/*.json'],
		files: [],
	});

	return configFile;
}
