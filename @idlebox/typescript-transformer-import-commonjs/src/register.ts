import { existsSync, readFileSync } from 'fs';
import { dirname, extname, resolve, join } from 'path';
import {
	ExportDeclaration,
	ImportDeclaration,
	isExportDeclaration,
	isImportDeclaration,
	isStringLiteral,
	Node,
	Program,
	SourceFile,
	StringLiteral,
	TransformationContext,
	visitEachChild,
	VisitResult,
} from 'typescript';

interface IOptions {
	specialExtensions?: string[];
	ignore?: string[];
	force?: string[];
	'package.json'?: string;
}

type IDeps = { [name: string]: string | undefined };

export default function plugin(program: Program, pluginOptions: IOptions = {}) {
	const specialExtensions = pluginOptions.specialExtensions || ['cjs', 'mjs', 'js', ''];
	let dependencies: IDeps | null;
	let packageFound = false;

	if (pluginOptions['package.json']) {
		const path = resolve(program.getCurrentDirectory(), pluginOptions['package.json']);
		if (!existsSync(path)) {
			throw new Error('package.json does not exists at ' + path);
		}
		packageFound = true;
		dependencies = createDeps(path);
	}

	return (transformationContext: TransformationContext) => (node: SourceFile): SourceFile => {
		if (!packageFound) {
			packageFound = true;
			const path = findUp(dirname(node.fileName), 'package.json');
			if (path) {
				dependencies = createDeps(path);
			}
		}
		if (!dependencies) {
			return node;
		}

		if (!isModuleNeedWrap(node, specialExtensions, dependencies)) {
			return node;
		}

		console.log('need wrap!!!', node.fileName);

		return visitEachChild(node, tokenWalk, transformationContext);

		function tokenWalk(node: Node): VisitResult<Node> {
			console.log(node.kind);
			return;
		}
	};
}

function isModuleNeedWrap(
	node: Node,
	specialExtensions: string[],
	dependencies: IDeps
): node is (ImportDeclaration | ExportDeclaration) & {
	moduleSpecifier: StringLiteral;
} {
	if (!isImportDeclaration(node) && !isExportDeclaration(node)) return false;
	if (node.moduleSpecifier === undefined) return false;
	// only when module specifier is valid
	if (!isStringLiteral(node.moduleSpecifier)) return false;
	const importPath = node.moduleSpecifier.text;
	// only when path is relative
	if (!importPath.startsWith('./') && !importPath.startsWith('../')) return false;
	// only when path does not have some special extension
	if (specialExtensions.includes(extname(importPath).replace(/^\./, ''))) return false;
	// only when dependency defined in package.json
	const moduleName = importPath.split('/', importPath.startsWith('@') ? 2 : 1).join('/');
	if (!dependencies.hasOwnProperty(moduleName)) return false;

	if (!dependencies[moduleName]) dependencies[moduleName] = loadType(moduleName);

	// only if package.json found for target file
	if (dependencies[moduleName] === undefined) return false;

	return dependencies[moduleName] === 'commonjs';
}

function findUp(p: string, f: string): string | null {
	const path = resolve(p, f);
	if (existsSync(path)) {
		return path;
	} else if (p === '/') {
		return null;
	} else {
		return findUp(dirname(p), f);
	}
}

function loadType(moduleName: string): string | undefined {
	const path = findUp(moduleName, join(moduleName, 'package.json'));
	if (path) {
		const pkg = JSON.parse(readFileSync(path, 'utf-8'));
		return pkg.type || 'commonjs';
	} else {
		return undefined;
	}
}

function createDeps(path: string): IDeps | null {
	const text = readFileSync(path, 'utf-8');

	const pkg = JSON.parse(text);

	if (!pkg.dependencies) return null;

	const deps: IDeps = {};
	for (const i of Object.keys(pkg.dependencies)) {
		deps[i] = '';
	}
	return deps;
}
