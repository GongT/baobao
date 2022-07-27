import { dirname, resolve } from 'path';
import { existsSync } from 'fs-extra';
import { Program } from 'typescript';
import { IDebug } from './debug';
import { ValidImportOrExportDeclaration } from './types';

/**
 * check an import statement, check if included in program, not an external/module file
 * @param debug logger
 * @param source which file contains this import
 * @param node a statement to check
 * @param program if set, limit project files by typescript, not only filesystem
 */
export function testProjectFile(
	debug: IDebug,
	source: string,
	node: ValidImportOrExportDeclaration,
	program?: Program
): boolean {
	const importPath = node.moduleSpecifier.text;
	if (!importPath.startsWith('./') && !importPath.startsWith('../')) return false;

	if (importPath.endsWith('.js') || importPath.endsWith('.jsx')) {
		debug('import from %s, should not have extension.', importPath);
		return false;
	}

	const dir = dirname(source);
	for (const ext of ['.ts', '.tsx', '.js']) {
		const fp = resolve(dir, importPath + ext);
		if (program) {
			if (program.getSourceFile(fp)) {
				return true;
			}
		} else {
			if (existsSync(fp)) {
				return true;
			}
		}
	}
	debug('  ! imported file not in program');
	debug('      from:    %s', source);
	debug('      require: %s', importPath);
	return false;
}
