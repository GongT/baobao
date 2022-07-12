import { Node, Program, SourceFile, TransformationContext, Transformer, visitEachChild, VisitResult } from 'typescript';
import { IDebug } from './debug';
import { shouldMutateModuleSpecifier, ValidImportOrExportDeclaration } from './shouldMutateModuleSpecifier';

export function appendDotJs(
	program: Program,
	transformationContext: TransformationContext,
	console: IDebug
): Transformer<SourceFile> {
	function visitNode(node: Node): VisitResult<Node> {
		if (shouldMutateModuleSpecifier(node.getSourceFile().fileName, node, console, program)) {
			console.debug(' * %s', node.getText(node.getSourceFile()).split('\n')[0]);
			const modified: ValidImportOrExportDeclaration = Object.create(node);
			const moduleSpecifier = transformationContext.factory.createStringLiteral(
				`${node.moduleSpecifier.text}.js`
			);
			Object.assign(moduleSpecifier, { parent: node });
			Object.assign(modified, { moduleSpecifier });
			return modified;
		} else if (node.getText(node.getSourceFile()).startsWith('import ')) {
			console.debug(' ? %s', node.getText(node.getSourceFile()).split('\n')[0]);
		}
		return node;
	}

	return (sourceFile: SourceFile) => {
		console.debug('[trans] visit \x1B[2m%s\x1B[0m', sourceFile.fileName);
		const result = visitEachChild(sourceFile, visitNode, transformationContext);
		console.debug('[trans] visit complete');
		return result;
	};
}
