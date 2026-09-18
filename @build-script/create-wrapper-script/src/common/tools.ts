import { normalizePath, relativePath } from '@idlebox/common';
import { dirname } from 'node:path';
import type { IExtOpt } from './types.js';

export function findRoot(options: IExtOpt) {
	if (!options.root) return '';

	const d = normalizePath(dirname(options.wrapperFile));

	if (d.startsWith(options.root)) {
		return relativePath(d, options.root);
	}

	return options.root;
}
