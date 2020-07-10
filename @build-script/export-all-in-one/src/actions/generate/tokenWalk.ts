import { basename, normalize } from 'path';
import {
	BindingName,
	ExportAssignment,
	Identifier,
	isArrayBindingPattern,
	isClassDeclaration,
	isEnumDeclaration,
	isExportAssignment,
	isExportDeclaration,
	isFunctionDeclaration,
	isIdentifier,
	isInterfaceDeclaration,
	isModuleDeclaration,
	isNamespaceExport,
	isObjectBindingPattern,
	isOmittedExpression,
	isStringLiteral,
	isTypeAliasDeclaration,
	isVariableStatement,
	ModuleDeclaration,
	Node,
	SyntaxKind,
	TypeChecker,
	VariableDeclaration,
	VariableStatement,
} from 'typescript';
import { shouldIncludeNode } from './testForExport';
import { SOURCE_ROOT } from '../../inc/argParse';
import { debug } from '../../inc/debug';
import { ExportCollector } from '../../inc/exportCollector';
import { idToString } from '../../inc/util';

Object.assign(global, { SyntaxKind });

function warn(node: Node, s: string, e?: Error) {
	if (e instanceof Error) {
		if (e.stack) {
			const path = e.stack.split(/\n/g, 2).join('\n\t');
			s += ': ' + path;
		} else {
			s += '(no stack trace)';
		}
	}
	let lineno: string = '';
	try {
		lineno = ':' + node.getSourceFile().getText().slice(0, node.getStart()).split('\n').length;
	} catch (e) {}
	console.error('\x1B[38;5;9m%s: %s%s\x1B[0m\n\t%s', s, node.getSourceFile().fileName, lineno, node.getText());
}
export function tokenWalk(collect: ExportCollector, node: Node, _checker: TypeChecker) {
	const relative = relativeToRoot(node.getSourceFile().fileName);

	if (isExportDeclaration(node)) {
		// export {a as b, c} from X;
		debug(' * found ExportDeclaration');
		if (node.exportClause) {
			const replaced: string[] = [];
			if (isNamespaceExport(node.exportClause)) {
				replaced.push(idToString(node.exportClause.name));
			} else {
				for (const item of node.exportClause.elements) {
					replaced.push(idToString(item.name));
				}
			}
			collect.addExport(relative, replaced);
		} else {
			// export * from X;
			let path: string;
			try {
				path = (0 || eval)(node.moduleSpecifier!.getText());
			} catch (e) {
				warn(node, 'syntax error found');
				return;
			}

			collect.addExport(relativeToRoot(path), ['*']);
		}

		return;
	}

	if (!shouldIncludeNode(node)) {
		debug(' * should not include node: %s', SyntaxKind[node.kind]);
		return;
	}

	if (isExportAssignment(node)) {
		// export default Value
		debug(' * found ExportAssignment');
		const ea = node as ExportAssignment;
		const id: Identifier | undefined = isIdentifier(ea.expression) ? ea.expression : undefined;

		const name = getName(id, relative, false);

		// nodeComment(ret, node, checker);
		collect.addTransform(relative, name);

		return;
	}

	if (!isExported(node)) {
		debug(' * not exported: %s', SyntaxKind[node.kind]);
		return;
	}

	if (isModuleDeclaration(node)) {
		debug(' * found ModuleDeclaration');
		// export namespace|module
		const md = node as ModuleDeclaration;
		if (isStringLiteral(md.name)) {
			warn(md, 'only .d.ts can use this, and export-all-in-one do not support this.');
		} else {
			collect.addExport(relative, [idToString(md.name)]);
		}

		return;
	}
	if (isClassDeclaration(node)) {
		// export interface XXX {} InterfaceDeclaration
		debug(' * found ClassDeclaration');
		const name = getName(node.name, relative, true);
		doExport(collect, node, name, relative);

		return;
	}
	if (isInterfaceDeclaration(node)) {
		// export class XXX {} ClassDeclaration
		debug(' * found InterfaceDeclaration');
		const name = getName(node.name, relative, 'I');
		doExport(collect, node, name, relative);

		return;
	}
	if (isFunctionDeclaration(node)) {
		// export function XXX {} FunctionDeclaration
		debug(' * found FunctionDeclaration');
		const name = getName(node.name, relative, false);
		doExport(collect, node, name, relative);

		return;
	}
	if (isEnumDeclaration(node)) {
		// export enum XXX { ... }
		debug(' * found EnumDeclaration');
		const name = getName(node.name, relative, false);
		doExport(collect, node, name, relative);

		return;
	}
	if (isVariableStatement(node)) {
		// export const/let/var Value
		const vs = node as VariableStatement;
		const names: string[] = [];
		vs.declarationList.declarations.forEach((node: VariableDeclaration) => {
			findingBindingType(node.name)
				.filter((e) => !!e)
				.forEach((n) => {
					names.push(n);
				});
		});

		collect.addExport(relative, names);

		return;
	}

	if (isTypeAliasDeclaration(node)) {
		// export type x = ...
		debug(' * found TypeAliasDeclaration');
		collect.addExport(relative, [idToString(node.name)]);
		return;
	}

	warn(node, 'Not handled');
}

function findingBindingType(node: BindingName): string[] {
	const ret: string[] = [];
	if (isObjectBindingPattern(node)) {
		for (const element of node.elements) {
			ret.push(...findingBindingType(element.name));
		}
	} else if (isArrayBindingPattern(node)) {
		for (const element of node.elements) {
			if (!isOmittedExpression(element)) {
				ret.push(...findingBindingType(element.name));
			}
		}
	} else if (isIdentifier(node)) {
		ret.push(idToString(node));
	}
	return ret;
}

function doExport(collect: ExportCollector, node: Node, name: string, file: string) {
	if (isDefaultExport(node)) {
		collect.addTransform(file, name);
	} else {
		collect.addExport(file, [name]);
	}
}

export function relativeToRoot(abs: string) {
	return normalize(abs)
		.replace(SOURCE_ROOT, '')
		.replace(/^[\/\\]/g, '')
		.replace(/\.tsx?$/, '');
}

function getName(name: Identifier | undefined, file: string, big: boolean | string) {
	if (name) {
		return idToString(name);
	} else {
		return varNameFromFile(file, big);
	}
}

function varNameFromFile(file: string, big: boolean | string) {
	let name = basename(file);
	if (big) {
		name = name.replace(/^[a-z]/, (e) => e.toUpperCase());
		if (typeof big === 'string') {
			name = big + name;
		}
	} else {
		name = name.replace(/^[A-Z]/, (e) => e.toLowerCase());
	}

	name = name.replace(/[_-][a-z]/g, (e) => e[1].toUpperCase());

	return name;
}

function isExported(node: Node) {
	if (!node.modifiers) {
		return false; // no any modify
	}
	return node.modifiers.findIndex((e) => e.kind === SyntaxKind.ExportKeyword) !== -1;
}

function isDefaultExport(node: Node) {
	if (!node.modifiers) {
		return false; // no any modify
	}
	return node.modifiers.findIndex((e) => e.kind === SyntaxKind.DefaultKeyword) !== -1;
}
