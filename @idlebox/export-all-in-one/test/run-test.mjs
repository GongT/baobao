import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { writeFileSync } from 'fs';
import { createRequire } from 'module';

process.stderr.write('\x1Bc');

const singleFile = process.argv[2];

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsconfig = {
	extends: '../node_modules/@idlebox/single-dog-asset/package/tsconfig.json',
	compilerOptions: {
		module: 'ESNext',
		baseUrl: '.',
		outDir: './temp',
		typeRoots: [],
		rootDir: '.',
	},
};
if (singleFile) {
	tsconfig.files = [singleFile];
}

writeFileSync(resolve(__dirname, 'tsconfig.json'), JSON.stringify(tsconfig, null, 4));

process.chdir(__dirname);
const index = resolve(__dirname, '../index.js');
process.argv = [process.argv0, index, '.'];

const require = createRequire(__dirname);
require(index);
