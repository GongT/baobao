import { emptyDirSync, ensureDir, writeFileSync } from 'fs-extra';
import { basename, dirname } from 'path';
import { createCompilerHost, createProgram, forEachChild, Node, Program, SourceFile } from 'typescript';
import { CONFIG_FILE, EXPORT_TEMP_PATH, targetIndexFile } from '../inc/argParse';
import { getOptions } from '../inc/configFile';
import { copyFilteredSourceCodeFile } from './generate/copySourceCodeFiles';
import { filterIgnoreFiles, isFileIgnored } from './generate/filterIgnoreFiles';
import { relativeToRoot, tokenWalk } from './generate/tokenWalk';

export async function doGenerate() {
	const command = getOptions();
	console.log('\x1B[38;5;10mcreating typescript program from %s...\x1B[0m', CONFIG_FILE);
	emptyDirSync(EXPORT_TEMP_PATH);
	const host = createCompilerHost(command.options, true);

	const program: Program = createProgram(filterIgnoreFiles(command), command.options, host);

	const checker = program.getTypeChecker();

	const sources: string[] = [];
	let file: SourceFile;

	for (file of program.getSourceFiles()) {
		// console.log('%s -> declare:%s, stdlib:%s, external:%s', file.fileName, file.isDeclarationFile, program.isSourceFileDefaultLibrary(file), program.isSourceFileFromExternalLibrary(file));
		if (/*file.isDeclarationFile || */ program.isSourceFileDefaultLibrary(file) || program.isSourceFileFromExternalLibrary(file)) {
			continue;
		}

		const fileSources = [`//// - ${relativeToRoot(file.fileName)}`];

		await copyFilteredSourceCodeFile(file, checker);

		if (isFileIgnored(file.fileName)) {
			fileSources.push(`// ignore by default`);
			fileSources.push(``);
		} else {
			const fnDebug = file.fileName.slice(0, process.stdout.columns! - 8 || Infinity);
			process.stdout.write(`\x1B[K\x1B[2m - ${fnDebug}...\x1B[0m\x1B[K\r`);
			forEachChild(file, (node: Node) => {
				tokenWalk(fileSources, node, checker);
			});
			fileSources.push(``);
		}
		if (basename(file.fileName) === 'index.ts') {
			sources.unshift(...fileSources);
		} else {
			sources.push(...fileSources);
		}
	}
	console.log('\x1B[K\x1B[38;5;10mtypescript program created!\x1B[0m');

	const newFileData = sources.filter((item, _index, self) => {
		return self.indexOf(item) === self.lastIndexOf(item);
	}).join('\n');

	ensureDir(dirname(targetIndexFile));
	writeFileSync(targetIndexFile, newFileData, 'utf8');
}
