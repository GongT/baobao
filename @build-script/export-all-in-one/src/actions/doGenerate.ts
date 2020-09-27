import { emptyDirSync, ensureDir, writeFileSync } from 'fs-extra';
import { dirname, resolve } from 'path';
import { createCompilerHost, createProgram, forEachChild, Node, Program, SourceFile } from 'typescript';
import { copyFilteredSourceCodeFile } from './generate/copySourceCodeFiles';
import { filterIgnoreFiles, isFileIgnored } from './generate/filterIgnoreFiles';
import { tokenWalk } from './generate/tokenWalk';
import { CONFIG_FILE, EXPORT_TEMP_PATH, INDEX_FILE_NAME, TEMP_SOURCE_DIR_NAME } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { debug } from '../inc/debug';
import { ExportCollector } from '../inc/exportCollector';

export async function doGenerate() {
	const command = getOptions();
	console.log('\x1B[38;5;10mcreate typescript program.\x1B[0m');
	debug('  from file %s.', CONFIG_FILE);
	emptyDirSync(EXPORT_TEMP_PATH);
	const host = createCompilerHost(command.options, true);

	const program: Program = createProgram(filterIgnoreFiles(command), command.options, host);

	const checker = program.getTypeChecker();

	const sources = new ExportCollector();
	let file: SourceFile;

	for (file of program.getSourceFiles()) {
		const isDefaultLibrary = program.isSourceFileDefaultLibrary(file);
		const isFromExternalLibrary = program.isSourceFileFromExternalLibrary(file);
		debug(
			'%s -> declare:%s, stdlib:%s, external:%s',
			file.fileName,
			file.isDeclarationFile,
			isDefaultLibrary,
			isFromExternalLibrary
		);
		if (isDefaultLibrary || isFromExternalLibrary) {
			continue;
		}

		await copyFilteredSourceCodeFile(file, checker);

		if (isFileIgnored(file.fileName) || file.isDeclarationFile) {
			debug(`ignore file: "${file.fileName}"`);
		} else {
			debug(`parse file: "${file.fileName}"`);
			forEachChild(file, (node: Node) => {
				tokenWalk(sources, node, checker);
			});
			debug('');
		}
	}
	sources.normalize();

	const targetIndexFile = resolve(EXPORT_TEMP_PATH, TEMP_SOURCE_DIR_NAME, INDEX_FILE_NAME + '.ts');
	ensureDir(dirname(targetIndexFile));
	writeFileSync(targetIndexFile, sources.createTypeScript({ extension: false }), 'utf8');

	if (!command.options.outDir) {
		throw new Error('Invalid project: no outDir in tsconfig.json.');
	}

	return sources;
}
