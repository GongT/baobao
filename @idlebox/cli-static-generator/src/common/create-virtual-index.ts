import { randomUUID } from 'node:crypto';
import type { Plugin } from 'rollup';

export function createVirtualIndex(root: string, content: string) {
	const rid = randomUUID();
	const indexName = `${root}/${rid}.ts`;

	return {
		input: indexName,
		content,

		plugin: {
			name: 'resolve-memory',
			resolveId(source) {
				if (source === indexName) {
					return indexName;
				}
				return null;
			},
			load(id) {
				if (id === indexName) {
					return { code: content };
				}
				return null;
			},
		} satisfies Plugin,
	};
}
