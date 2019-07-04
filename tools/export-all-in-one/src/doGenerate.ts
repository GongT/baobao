import { copyFile, emptyDirSync, writeFileSync } from 'fs-extra';
import { basename, dirname, resolve } from 'path';
import { createCompilerHost, createProgram, forEachChild, Node, Program, SourceFile } from 'typescript';
import { rewriteApiExtractorConfig } from './apiExtractor';
import { CONFIG_FILE, EXPORT_TEMP_PATH, targetIndexFile } from './argParse';
import { getOptions } from './configFile';
import { copyFilteredSourceCodeFile } from './copySourceCodeFiles';
import { rewriteProjectDtsJson, writeDtsJson } from './dts';
import { filterIgnoreFiles, isFileIgnored } from './filterIgnoreFiles';
import { projectPackagePath } from './package';
import { relativeToRoot, tokenWalk } from './tokenWalk';

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
		if (file.isDeclarationFile || program.isSourceFileFromExternalLibrary(file)) {
			// console.log(file.fileName, file.isDeclarationFile, program.isSourceFileFromExternalLibrary(file));
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

	console.log('\x1B[38;5;10mwrite tsconfig.json...\x1B[0m');
	await rewriteProjectDtsJson();
	await writeDtsJson();

	console.log('\x1B[38;5;10mwrite api-extractor.json...\x1B[0m');
	await rewriteApiExtractorConfig();

	console.log('\x1B[38;5;10mcopy package.json...\x1B[0m');
	await copyFile(projectPackagePath(), resolve(EXPORT_TEMP_PATH, 'package.json'));

	const newFileData = sources.filter((item, _index, self) => {
		return self.indexOf(item) === self.lastIndexOf(item);
	}).join('\n');

	process.chdir(dirname(CONFIG_FILE));
	writeFileSync(targetIndexFile, newFileData, 'utf8');
}
