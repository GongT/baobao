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

interface InsertEmitHandler {
	(transformationContext: TransformationContext, sourceFile: SourceFile): void;
}

interface IDebug {
	(message?: any, ...optionalParams: any[]): void;
}

function createVisitor(extension: string, debug: IDebug, program?: Program) {
	return (node: Node): VisitResult<Node> => {
		if (shouldMutateModuleSpecifier(node.getSourceFile().fileName, node, debug, program)) {
			debug(' % %s', node.getText(node.getSourceFile()).split('\n')[0]);
			const modified: ValidImportOrExportDeclaration = { ...node };
			modified.moduleSpecifier = createLiteral(`${node.moduleSpecifier.text}${extension}`);
			return modified;
		} else if (node.getText(node.getSourceFile()).startsWith('import ')) {
			debug(' ? %s', node.getText(node.getSourceFile()).split('\n')[0]);
		}
		return node;
	};
}

export function createExtensionTransformer(
	extension: string,
	program?: Program,
	insertEmit?: InsertEmitHandler,
	verbose: boolean = false
): TransformerFactory<SourceFile> {
	if (!extension.startsWith('.')) extension = '.' + extension;
	const debug: IDebug = verbose ? console.error.bind(console) : () => {};

	const visitNode = createVisitor(extension, debug, program);

	return function transformer(transformationContext: TransformationContext) {
		return (sourceFile: SourceFile) => {
			if (insertEmit) {
				transformationContext.onEmitNode(EmitHint.SourceFile, sourceFile, () => {
					insertEmit(transformationContext, sourceFile);
				});
			}

			debug(' %s +++ %s', sourceFile.fileName, extension);
			return visitEachChild(sourceFile, visitNode, transformationContext);
		};
	};
}

type ValidImportOrExportDeclaration = (ImportDeclaration | ExportDeclaration) & {
	moduleSpecifier: StringLiteral;
};

function shouldMutateModuleSpecifier(
	source: string,
	node: Node,
	debug: IDebug,
	program?: Program
): node is ValidImportOrExportDeclaration {
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
		debug('LOL123', dir, node.moduleSpecifier.text);
	} else {
		// TODO: handle paths mapping (absolute to tsconfig.json)
		return false;
	}

	return false;
}
