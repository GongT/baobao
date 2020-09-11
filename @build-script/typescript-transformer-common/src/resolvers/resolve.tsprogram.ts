import { extname, resolve } from 'path';
import { pathExistsSync } from 'fs-extra';
import { Program } from 'typescript';
import { collectImportNames } from '../importIds';
import { ValidImportOrExportDeclaration } from '../types';
import { IImportInfoMissing, IImportInfoTypeSource } from './types';

export function resolveProjectFile(
	node: ValidImportOrExportDeclaration,
	program?: Program
): IImportInfoTypeSource | IImportInfoMissing {
	const importPath = node.moduleSpecifier.text;
	const currentFile = node.getSourceFile().fileName;
	const wantFile = resolve(currentFile, '..', importPath);
	let checkExtensions = ['.ts', '.tsx', extname(currentFile)];

	if (program) {
		if (program.getCompilerOptions().allowJs) {
			checkExtensions.push('.js', '.jsx');
		}
	}

	for (const ext of checkExtensions) {
		if (pathExistsSync(wantFile + ext)) {
			return {
				type: 'typescript',
				identifiers: collectImportNames(node),
				nodeResolve: importPath,
				fsPath: wantFile + ext,
				specifier: importPath,
			};
		}
	}

	return {
		type: 'missing',
		specifier: importPath,
	};
}
