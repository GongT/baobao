import { createRequire } from 'module';
import { __assign } from 'tslib';

+__assign;

let found = '';
export function findTslib(): string[] {
	if (found) return [found];

	const require = createRequire(__dirname);
	found = require.resolve('tslib/tslib.d.ts');

	return [found];
}
