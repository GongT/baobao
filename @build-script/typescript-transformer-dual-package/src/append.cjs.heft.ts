import {
	idText,
	isMetaProperty,
	isPropertyAccessExpression,
	Node,
	Program,
	SourceFile,
	SyntaxKind,
	TransformationContext,
	visitEachChild,
	VisitResult,
} from 'typescript';
import { IDebug } from './debug';
import { shouldMutateModuleSpecifier } from './shouldMutateModuleSpecifier';

export function appendDotCjsDirect(program: Program, transformationContext: TransformationContext, debug: IDebug) {
	function addCjsExtension(transformationContext: TransformationContext) {
		function visitNode(node: Node): VisitResult<Node> {
			if (shouldMutateModuleSpecifier(node.getSourceFile().fileName, node, debug, program)) {
				const moduleSpecifier = transformationContext.factory.createStringLiteral(
					`${node.moduleSpecifier.text}.cjs`
				);
				Object.assign(moduleSpecifier, { parent: node });
				Object.assign(node, { moduleSpecifier });
			}
			return node;
		}

		return (sourceFile: SourceFile) => {
			return visitEachChild(sourceFile, visitNode, transformationContext);
		};
	}

	// https://github.com/Jack-Works/commonjs-import.meta/blob/master/index.ts
	function updateMetaRequest(transformationContext: TransformationContext) {
		// @ts-ignore
		const { factory: ts } = transformationContext;
		function visitNode(node: Node): Node | Node[] | undefined {
			if (
				isPropertyAccessExpression(node) &&
				isMetaProperty(node.expression) &&
				idText(node.expression.name) === 'meta' &&
				idText(node.name) === 'url'
			) {
				return ts.createParenthesizedExpression(
					ts.createBinaryExpression(
						ts.createStringLiteral('file://'),
						SyntaxKind.PlusToken,
						ts.createIdentifier('__filename')
					)
				);
			} else {
				return visitEachChild(node, visitNode, transformationContext);
			}
		}
		return (sourceFile: SourceFile) => {
			return visitEachChild(sourceFile, visitNode, transformationContext);
		};
	}

	const a = addCjsExtension(transformationContext);
	const b = updateMetaRequest(transformationContext);
	return (sourceFile: SourceFile) => {
		return b(a(sourceFile));
	};
}
