import { logger } from '@idlebox/logger';
import { findSourceMap, type SourceMapping } from 'node:module';

export function mapSourceFile(file: string): string {
	return mapSourcePosition({ source: file, column: 0, line: 1 }).source;
}

interface ISourcePosition {
	readonly source: string;
	readonly line: number;
	readonly column: number;
}

/**
 * 使用source-map来映射源文件位置
 * 如果未能找到，则返回原始位置
 *
 * 注意: 如果映射成功，则返回的source是file://URL
 */
export function mapSourcePosition(pos: ISourcePosition) {
	const source = pos.source.startsWith('file://') ? pos.source.slice(7) : pos.source;
	const map = findSourceMap(source);
	if (!map) {
		logger.debug`未找到source-map文件: ${source}`;
		return pos;
	}
	const mapped = map.findEntry(pos.line, pos.column) as SourceMapping;
	if (!Object.hasOwn(mapped, 'originalSource') || !mapped.originalSource) {
		logger.debug`source-map文件中找不到此行: ${source} (:${pos.line}:${pos.column})`;
		return pos;
	}
	return {
		source: mapped.originalSource,
		line: mapped.originalLine,
		column: mapped.originalColumn,
	};
}
