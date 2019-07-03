import { ensureDirSync } from 'fs-extra';
import { dirname, relative, resolve } from 'path';
import {
	addSyntheticLeadingComment,
	createPrinter,
	displayPartsToString,
	getJSDocTags,
	isImportDeclaration,
	isImportEqualsDeclaration,
	isJSDoc,
	JSDoc,
	Node,
	Printer,
	SourceFile,
	SyntaxKind,
	transform,
	TransformationContext,
	TransformationResult,
	TypeChecker,
	visitEachChild,
} from 'typescript';
import { EXPORT_TEMP_PATH, SOURCE_ROOT } from './argParse';
import { getOptions } from './configFile';
import { shouldIncludeNode } from './testForExport';
import { idToString } from './util';
import { writeFileSyncIfChange } from './writeFile';

const internalHint = '\n * @internal\n';

function createCommentByComment(node: JSDoc) {
	const lines: string[] = [];
	lines.push(node.comment);
	for (const item of node.tags) {
		let line = '';
		// if (item.atToken) {
		// 	line += '@';
		// }
		if (item.tagName) {
			line += idToString(item.tagName);
		}
		if (item.comment) {
			line += ' ' + item.comment;
		}
		lines.push(line);
	}
	return lines.join('\n * ') + internalHint;
}

function prependJSDocComment(node: Node, checker: TypeChecker) {
	if (isImportEqualsDeclaration(node) || isImportDeclaration(node)) {
		return node;
	}
	if (!shouldIncludeNode(node)) {
		const tags = getJSDocTags(node);
		let comment = '';
		if (tags.length) {
			if (isJSDoc(tags[0].parent)) {
				comment = createCommentByComment(tags[0].parent as JSDoc);
			}
		} else {
			const symb = checker.getSymbolAtLocation((node as any).name);
			if (symb) {
				const jsdocs = symb.getDocumentationComment(checker);
				comment = displayPartsToString(jsdocs) + internalHint;
			} else {
				comment = internalHint;
			}
		}
		if (comment) {
			return addSyntheticLeadingComment(node, SyntaxKind.MultiLineCommentTrivia, '*\n' + comment, true);
		}
	}
	return node;
}

function visitSourceFile(sourceFile: SourceFile, context: TransformationContext, checker: TypeChecker, visitNode: (node: Node, checker: TypeChecker) => Node) {
	return visitEachChild(sourceFile, (node: Node) => {
		return visitNode(node, checker);
	}, context);
}

export function copyFilteredSourceCodeFile(file: SourceFile, checker: TypeChecker) {
	const target = resolve(EXPORT_TEMP_PATH, 'extracted-source', relative(SOURCE_ROOT, file.fileName));

	const printer: Printer = createPrinter();
	const result: TransformationResult<SourceFile> = transform<SourceFile>(
		file, [context => sourceFile => visitSourceFile(sourceFile, context, checker, prependJSDocComment)], getOptions().options,
	);
	const transformedSourceFile: SourceFile = result.transformed[0];
	const newContent = printer.printFile(transformedSourceFile);
	result.dispose();

	ensureDirSync(dirname(target));
	writeFileSyncIfChange(target, newContent);
}
