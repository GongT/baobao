import { basename, normalize, resolve } from 'path';
import { SOURCE_ROOT } from './argParse';
import {
	BindingName,
	ClassDeclaration,
	ExportAssignment,
	ExportDeclaration,
	FunctionDeclaration,
	Identifier,
	InterfaceDeclaration,
	isArrayBindingPattern,
	isClassDeclaration,
	isExportAssignment,
	isExportDeclaration,
	isFunctionDeclaration,
	isIdentifier,
	isInterfaceDeclaration,
	isModuleDeclaration,
	isObjectBindingPattern,
	isOmittedExpression,
	isStringLiteral,
	isVariableStatement,
	ModuleDeclaration,
	Node,
	StringLiteral,
	SyntaxKind,
	TypeChecker,
	VariableDeclaration,
	VariableStatement,
} from 'typescript';
import { nodeComment, shouldIncludeNode } from './testForExport';
import { idToString } from './util';

Object.assign(global, { SyntaxKind });

function warn(node: Node, s: string, e?: Error) {
	if (e instanceof Error) {
		const path = e.stack.split(/\n/g, 2).join('\n\t');
		s += ': ' + path;
	}
	console.error('%s - %s\n\t\x1B[38;5;9m%s\x1B[0m', node.getSourceFile().fileName, node.getText(), s);
}

export function tokenWalk(ret: string[], node: Node, checker: TypeChecker) {
	const relative = './' + relativeToRoot(node.getSourceFile().fileName);
	
	if (isExportDeclaration(node) && shouldIncludeNode(node)) {
		// export a from b;
		// export {a,b,c};
		const ed = node as ExportDeclaration;
		if (ed.moduleSpecifier) {
			if (isStringLiteral(ed.moduleSpecifier)) {
				try {
					// nodeComment(ret, node, checker);
					ret.push(`export ${normalizeExportClause(ed)} from ${resolveRelate(ed.moduleSpecifier)};`);
				} catch (e) {
					warn(ed.moduleSpecifier, 'tokenWalk failed', e);
				}
			} else {
				warn(ed.moduleSpecifier, 'import from invalid path');
			}
		} else {
			// nodeComment(ret, node, checker);
			ret.push(`export ${normalizeExportClause(ed)} from '${relative}';`);
		}
	} else if (isModuleDeclaration(node) && isExported(node) && shouldIncludeNode(node)) {
		// export namespace|module
		const md = node as ModuleDeclaration;
		if (isStringLiteral(md.name)) {
			warn(md, 'only .d.ts can use this.');
		} else {
			// nodeComment(ret, node, checker);
			ret.push(`export { ${idToString(md.name)} } from '${relative}';`);
		}
	} else if (isInterfaceDeclaration(node) && isExported(node) && shouldIncludeNode(node)) {
		// export interface
		const id = node as InterfaceDeclaration;
		const name = getName(id.name, relative, 'I');
		
		// nodeComment(ret, node, checker);
		doExport(ret, id, name, relative);
	} else if (isClassDeclaration(node) && isExported(node) && shouldIncludeNode(node)) {
		// export class
		const cd = node as ClassDeclaration;
		const name = getName(cd.name, relative, true);
		
		// nodeComment(ret, node, checker);
		doExport(ret, cd, name, relative);
	} else if (isFunctionDeclaration(node) && isExported(node) && shouldIncludeNode(node)) {
		// export function abc
		const fd = node as FunctionDeclaration;
		const name = getName(fd.name, relative, false);
		
		// nodeComment(ret, node, checker);
		doExport(ret, fd, name, relative);
	} else if (isExportAssignment(node) && shouldIncludeNode(node)) {
		// export default Value
		const ea = node as ExportAssignment;
		const id: Identifier = isIdentifier(ea.expression)? ea.expression : null;
		
		const name = getName(id, relative, false);
		// nodeComment(ret, node, checker);
		ret.push(`import ${name} from '${relative}'; export { ${name} };`);
	} else if (isVariableStatement(node) && isExported(node) && shouldIncludeNode(node)) {
		// export const/let/var Value
		const vs = node as VariableStatement;
		const names = vs.declarationList.declarations.map((node: VariableDeclaration) => {
			return findingBindingType(node.name);
		}).filter(e => !!e).join(', ');
		
		// nodeComment(ret, node, checker);
		ret.push(`export {${names}} from '${relative}';`);
		// } else if (isImportDeclaration(node) && !isCommentIgnore(node)) { 	// not used import will cause error, and that is no effect
	} else {
		if (shouldIncludeNode(node)) {
			nodeComment(ret, node, checker);
		}
		
		// console.log('ignore AST node: %s', SyntaxKind[node.kind]);
	}
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

function doExport(ret: string[], node: Node, name: string, file: string) {
	if (isDefaultExport(node)) {
		ret.push(`import ${name} from '${file}'; export { ${name} };`);
	} else {
		ret.push(`export { ${name} } from '${file}';`);
	}
}

function normalizeExportClause(node: ExportDeclaration) {
	if (!node.exportClause) {
		return '*';
	}
	const replaced: string[] = [];
	for (const item of node.exportClause.elements) {
		replaced.push(idToString(item.name));
	}
	return '{ ' + replaced.join(', ') + ' }';
}

function resolveRelate(fileLiteral: StringLiteral) {
	const str = (0 || eval)(fileLiteral.getText());
	if (str.startsWith('.')) {
		const abs = resolve(fileLiteral.getSourceFile().fileName, '..', str);
		return `'${relativeToRoot(abs)}'`;
	} else {
		return `'${str}'`;
	}
}

export function relativeToRoot(abs: string) {
	return normalize(abs).replace(SOURCE_ROOT, '').replace(/^[\/\\]/g, '').replace(/\.ts$/, '');
}

function getName(name: Identifier, file: string, big: boolean | string) {
	if (name) {
		return idToString(name);
	} else {
		return varNameFromFile(file, big);
	}
}

function varNameFromFile(file: string, big: boolean | string) {
	let name = basename(file);
	if (big) {
		name = name.replace(/^[a-z]/, e => e.toUpperCase());
		if (typeof big === 'string') {
			name = big + name;
		}
	} else {
		name = name.replace(/^[A-Z]/, e => e.toLowerCase());
	}
	
	name = name.replace(/[_-][a-z]/g, e => e[1].toUpperCase());
	
	return name;
}

function isExported(node: Node) {
	if (!node.modifiers) {
		return false; // no any modify
	}
	return node.modifiers.findIndex(e => e.kind === SyntaxKind.ExportKeyword) !== -1;
	
}

function isDefaultExport(node: Node) {
	if (!node.modifiers) {
		return false; // no any modify
	}
	return node.modifiers.findIndex(e => e.kind === SyntaxKind.DefaultKeyword) !== -1;
	
}