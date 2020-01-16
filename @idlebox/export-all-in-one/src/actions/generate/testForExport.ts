import { getJSDocTags, Node } from 'typescript';
import { exportConfig } from '../../inc/argParse';
import { idToString } from '../../inc/util';

export enum ExportType {
	EXCLUDE_INTERNAL,
	INCLUDE_EXTERNAL,

	EXCLUDE_IMPLICIT,
	INCLUDE_IMPLICIT,
}

const DefaultVisible = exportConfig.exportEverything ? ExportType.INCLUDE_IMPLICIT : ExportType.EXCLUDE_IMPLICIT;

export function shouldIncludeNode(node: Node) {
	const type = checkCommentType(node);
	return type === ExportType.INCLUDE_EXTERNAL || type === ExportType.INCLUDE_IMPLICIT;
}

export function findMarkerComment() {}

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
	return DefaultVisible;
}
