import { extname } from 'path';
import ts, { getOriginalNode } from 'typescript';
import { formatMyDiagnostic } from './logger';

export function idToString(id: ts.Identifier) {
	return id.escapedText.toString();
}

export function nameToString(name: ts.Identifier | ts.StringLiteral) {
	if (ts.isStringLiteral(name)) {
		return name.text;
	} else {
		return name.escapedText.toString();
	}
}
type valid = {
	moduleSpecifier: ts.StringLiteral;
};
type ValidImportDeclaration = ts.ImportDeclaration & valid;
type ValidExportFromDeclaration = ts.ExportDeclaration & valid;
export type ValidImportOrExportFromDeclaration = ValidImportDeclaration | ValidExportFromDeclaration;

export function extensionIsKindOfScriptFile(f: string) {
	const e = extname(f).toLowerCase();
	return e === '.js' || e === '.jsx' || e === '.ts' || e === '.tsx' || e === '.cjs' || e === '.mjs';
}

export function isImportExportFrom(node: ts.Node): node is ValidImportOrExportFromDeclaration {
	if (!ts.isImportDeclaration(node) && !ts.isExportDeclaration(node)) {
		// not "import .. from" or "export .. from"
		return false;
	}
	const moduleSpecifier: ts.StringLiteral = node.moduleSpecifier as any;
	if (!moduleSpecifier) {
		// simple "export xxx" (not from)
		return false;
	}

	if (!(moduleSpecifier.kind === ts.SyntaxKind.StringLiteral || ts.isStringLiteral(moduleSpecifier))) {
		throw new SyntaxError(formatMyDiagnostic(node, 'invalid import/export moduleSpecifier'));
	}
	return true;
}

export function isEsModule(module?: ts.ModuleKind) {
	const mdl = module as number;

	return mdl >= ts.ModuleKind.ES2015 && mdl <= ts.ModuleKind.ESNext;
}

export function tryGetSourceFile(node: ts.Node): ts.SourceFile | undefined {
	if (ts.isSourceFile(node)) {
		return node;
	}

	if (node.parent) {
		const r = tryGetSourceFile(node.parent);
		if (r) {
			return r;
		}
	}

	const original = ts.getOriginalNode(node);
	if (original && node !== original) {
		const r = tryGetSourceFile(original);
		if (r) {
			return r;
		}
	}

	return undefined;
}

export function isAstNode(node: any): node is ts.Node {
	if (node && node.kind >= ts.SyntaxKind.FirstNode) {
		return true;
	}
	return false;
}

export function linkParentNode(element: ts.Node, parent: ts.Node) {
	if (!parent) return;

	if (!element.parent) {
		const original = getOriginalNode(parent);
		if (original && original !== parent) {
			parent = original;
		}

		Object.assign(element, { parent: parent.parent });
	}
}
