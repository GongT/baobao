import * as typescript from 'typescript';
import * as path from 'path';

interface InsertEmitHandler {
	(transformationContext: typescript.TransformationContext, sourceFile: typescript.SourceFile): void;
}

export function createExtensionTransformer(extension: string): typescript.TransformerFactory<typescript.SourceFile> {
	return _createExtensionTransformer(extension, null);
}

/** @internal */
export function _createExtensionTransformerInternal(
	extension: string,
	insertEmit: InsertEmitHandler
): typescript.TransformerFactory<typescript.SourceFile> {
	return _createExtensionTransformer(extension, insertEmit);
}

function _createExtensionTransformer(
	extension: string,
	insertEmit: InsertEmitHandler | null
): typescript.TransformerFactory<typescript.SourceFile> {
	if (!extension.startsWith('.')) extension = '.' + extension;

	return function transformer(transformationContext: typescript.TransformationContext) {
		return (sourceFile: typescript.SourceFile) => {
			function visitNode(node: typescript.Node): typescript.VisitResult<typescript.Node> {
				if (shouldMutateModuleSpecifier(node)) {
					if (typescript.isImportDeclaration(node)) {
						const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}${extension}`);
						// console.log('   %s', newModuleSpecifier.text);
						return typescript.updateImportDeclaration(node, node.decorators, node.modifiers, node.importClause, newModuleSpecifier);
					} else if (typescript.isExportDeclaration(node)) {
						const newModuleSpecifier = typescript.createLiteral(`${node.moduleSpecifier.text}${extension}`);
						// console.log('   %s', newModuleSpecifier.text);
						return typescript.updateExportDeclaration(node, node.decorators, node.modifiers, node.exportClause, newModuleSpecifier, false);
					}
				}
				return typescript.visitEachChild(node, visitNode, transformationContext);
			}

			if (insertEmit) {
				transformationContext.onEmitNode(typescript.EmitHint.SourceFile, sourceFile, () => {
					insertEmit(transformationContext, sourceFile);
				});
			}

			// console.log(' %s +++ %s', sourceFile.fileName, extension);
			return typescript.visitNode(sourceFile, visitNode);
		};
	};
}

function shouldMutateModuleSpecifier(
	node: typescript.Node
): node is (typescript.ImportDeclaration | typescript.ExportDeclaration) & {
	moduleSpecifier: typescript.StringLiteral;
} {
	if (!typescript.isImportDeclaration(node) && !typescript.isExportDeclaration(node)) return false;
	if (node.moduleSpecifier === undefined) return false;
	// only when module specifier is valid
	if (!typescript.isStringLiteral(node.moduleSpecifier)) return false;
	// only when path is relative
	if (!node.moduleSpecifier.text.startsWith('./') && !node.moduleSpecifier.text.startsWith('../')) return false;
	// only when module specifier has no extension
	if (path.extname(node.moduleSpecifier.text) !== '') return false;
	return true;
}
