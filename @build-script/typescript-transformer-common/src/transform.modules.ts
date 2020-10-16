import { builtinModules } from 'module';
import { relative } from 'path';
import { ValidImportOrExportDeclaration } from './types';

export function getImportedName(node: ValidImportOrExportDeclaration): string {
	return node.moduleSpecifier.text;
}

function _(node: string | ValidImportOrExportDeclaration): string {
	return typeof node === 'string' ? node : node.moduleSpecifier.text;
}

export function isImportNodeBuiltins(node: string | ValidImportOrExportDeclaration) {
	const importPath = _(node);

	if (builtinModules) {
		return builtinModules.includes(importPath);
	}
	try {
		return !require.resolve(importPath).includes('/');
	} catch {
		return false;
	}
}
export function isImportFromNodeModules(node: string | ValidImportOrExportDeclaration): boolean {
	const importPath = _(node);
	// only when path is not relative
	if (importPath.startsWith('./') || importPath.startsWith('../')) return false;

	// TODO: tsconfig resolve
	return true;
}

export function createDiagnosticMissingImport(node: ValidImportOrExportDeclaration) {
	return `(${nodeDiagnosticPosition(node)}) missing imported "${getImportedName(node)}".`;
}

/**
 * Create something like "xxx/yyy/zzz.ts:111:222"
 */
export function nodeDiagnosticPosition(node: ValidImportOrExportDeclaration) {
	let posPart = '';
	try {
		const lines = node
			.getSourceFile()
			.getText()
			.slice(0, node.getStart() + 1)
			.split('\n');
		posPart = ':' + lines.length;
		const last = lines.pop()!.length;
		posPart += ':' + last;
	} catch {}
	const filePos = relative(process.cwd(), node.getSourceFile().fileName);
	return `${filePos}${posPart}`;
}

export interface IImportTargetInfo {
	packageName: string;
	filePath: string;
}

/**
 * split "@some/package/file.js" into "@some/package" and "file.js"
 */
export function splitPackageName(path: string) {
	let i1 = path.indexOf('/');
	if (i1 === -1) return { packageName: path, filePath: '.' };
	if (path.startsWith('@')) {
		i1 = path.indexOf('/', i1 + 1);
		if (i1 === -1) return { packageName: path, filePath: '.' };
	}
	return { packageName: path.slice(0, i1), filePath: path.slice(i1 + 1) };
}
