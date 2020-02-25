import { existsSync } from 'fs';
import { dirname, resolve } from 'path';
import {
	createLiteral,
	EmitHint,
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
	TransformerFactory,
	visitEachChild,
	VisitResult,
} from 'typescript';
import * as ts from 'typescript';

const updateNode = (ts as any).updateNode;

if (!updateNode) {
	console.error('FatalError! TypeScript internal api has changed.');
	process.exit(1);
}

interface InsertEmitHandler {
	(transformationContext: TransformationContext, sourceFile: SourceFile): void;
}

export function createExtensionTransformer(extension: string, program?: Program): TransformerFactory<SourceFile> {
	return _createExtensionTransformer(extension, program);
}

/** @internal */
export function _createExtensionTransformerInternal(
	extension: string,
	program: Program,
	insertEmit: InsertEmitHandler
): TransformerFactory<SourceFile> {
	return _createExtensionTransformer(extension, program, insertEmit);
}

function createVisitor(extension: string, program?: Program) {
	return (node: Node): VisitResult<Node> => {
		if (shouldMutateModuleSpecifier(node.getSourceFile().fileName, node, program)) {
			const newModuleSpecifier = createLiteral(`${node.moduleSpecifier.text}${extension}`);
			node.moduleSpecifier = updateNode(newModuleSpecifier, node.moduleSpecifier);
		}
		return node;
	};
}

function _createExtensionTransformer(
	extension: string,
	program?: Program,
	insertEmit?: InsertEmitHandler
): TransformerFactory<SourceFile> {
	if (!extension.startsWith('.')) extension = '.' + extension;

	const visitNode = createVisitor(extension, program);

	return function transformer(transformationContext: TransformationContext) {
		return (sourceFile: SourceFile) => {
			if (insertEmit) {
				transformationContext.onEmitNode(EmitHint.SourceFile, sourceFile, () => {
					insertEmit(transformationContext, sourceFile);
				});
			}

			// console.log(' %s +++ %s', sourceFile.fileName, extension);
			return visitEachChild(sourceFile, visitNode, transformationContext);
		};
	};
}

function shouldMutateModuleSpecifier(
	source: string,
	node: Node,
	program?: Program
): node is (ImportDeclaration | ExportDeclaration) & {
	moduleSpecifier: StringLiteral;
} {
	if (!isImportDeclaration(node) && !isExportDeclaration(node)) {
		// not "import .. from" or "export .. from"
		return false;
	}
	if (!node.moduleSpecifier || !isStringLiteral(node.moduleSpecifier)) {
		// syntax error
		return false;
	}
	if (node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../')) {
		const dir = dirname(source);
		for (const ext of ['.ts', '.tsx', '.json']) {
			const fp = resolve(dir, node.moduleSpecifier.text + ext);
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
	} else {
		// TODO: handle paths mapping (absolute to tsconfig.json)
		return false;
	}

	return false;
}
