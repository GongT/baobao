import { displayPartsToString, getJSDocTags, Node, TypeChecker } from 'typescript';
import { idToString } from './util';

export enum ExportType {
	EXCLUDE_INTERNAL,
	INCLUDE_EXTERNAL,

	EXCLUDE_IMPLICIT,
	INCLUDE_IMPLICIT,
}

export function shouldIncludeNode(node: Node) {
	const type = checkCommentType(node);
	return type === ExportType.INCLUDE_EXTERNAL || type === ExportType.INCLUDE_IMPLICIT;
}

export function findMarkerComment() {

}

export function checkCommentType(node: Node): ExportType {
	for (const item of getJSDocTags(node)) {
		if (item.tagName) {
			const n = idToString(item.tagName).toLowerCase();
			if (n === 'extern') {
				return ExportType.INCLUDE_EXTERNAL;
			}
			if (n === 'internal') {
				return ExportType.EXCLUDE_INTERNAL;
			}
		}
	}
	return ExportType.INCLUDE_IMPLICIT;
}

export function nodeComment(ret: string[], node: Node, checker: TypeChecker) {
	const tags = getJSDocTags(node);
	if (tags.length) {
		ret.unshift(tags[0].parent.getFullText());
		return;
	}
	const symb = checker.getSymbolAtLocation((node as any).name);
	if (symb) {
		const jsdocs = symb.getDocumentationComment(checker);
		ret.unshift('/**' + displayPartsToString(jsdocs) + '*/');
	}
}
