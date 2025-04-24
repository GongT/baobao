import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { MyError } from './logger.js';
import type { ITypescriptFile } from './TokenCollector.js';

export type IFilterFunction = (list: ITypescriptFile[]) => void;

export function loadFilter(project: string, filterFile: string): IFilterFunction {
	const resolvedFilterFile = (() => {
		const require = createRequire(resolve(process.cwd(), project));
		try {
			return require.resolve(filterFile);
		} catch {
			try {
				return require.resolve(resolve(process.cwd(), filterFile));
			} catch {
				throw new MyError(`can not find filterFile: ${filterFile}`);
			}
		}
	})();

	const fn = require(resolvedFilterFile).export;
	if (typeof fn !== 'function') {
		throw new TypeError(`filter file not export default function: ${resolvedFilterFile}`);
	}
	return fn;
}
