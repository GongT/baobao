import { copyFile, pathExists, readFile, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { formatDiagnostics, ModuleKind, transpileModule } from 'typescript';
import { EXPORT_TEMP_PATH, INDEX_FILE_NAME, SOURCE_ROOT, TEMP_DIST_DIR_NAME } from '../inc/argParse';
import { getOptions } from '../inc/configFile';

export async function transpileIndexFile() {
	console.log('\x1B[38;5;10mcreate index file(s).\x1B[0m');
	const originalOptions = getOptions().options;

	const source = resolve(EXPORT_TEMP_PATH, TEMP_DIST_DIR_NAME, INDEX_FILE_NAME + '.js');
	const copyTarget = resolve(originalOptions.outDir || SOURCE_ROOT, INDEX_FILE_NAME + '.js');
	const transpileTarget = resolve(originalOptions.outDir || SOURCE_ROOT, INDEX_FILE_NAME + '.cjs');

	const sourceMap = source + '.map';
	if (pathExists(sourceMap)) {
		await copyFile(sourceMap, copyTarget + '.map');
	}

	const code = await readFile(source, 'utf-8');
	await writeFile(copyTarget, code);
	const ret = transpileModule(code, {
		compilerOptions: {
			declaration: false,
			inlineSourceMap: originalOptions.sourceMap || originalOptions.inlineSourceMap,
			inlineSources: originalOptions.sourceMap || originalOptions.inlineSourceMap,
			target: originalOptions.target,
			module: ModuleKind.CommonJS,
		},
		fileName: source,
		reportDiagnostics: true,
	});
	if (ret.diagnostics?.length) {
		console.error(
			formatDiagnostics(ret.diagnostics, {
				getCurrentDirectory(): string {
					return EXPORT_TEMP_PATH;
				},
				getCanonicalFileName(fileName: string): string {
					return fileName;
				},
				getNewLine(): string {
					return '\n';
				},
			})
		);
	}

	await writeFile(transpileTarget, ret.outputText);
}
