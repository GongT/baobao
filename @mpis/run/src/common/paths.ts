import { findUpUntilSync } from '@idlebox/node';
import { dirname } from 'node:path';

const root = findUpUntilSync({ file: 'package.json', from: process.cwd() });
if (!root) {
	throw new Error('Could not find project root directory');
}
export const projectRoot = dirname(root);

const self = findUpUntilSync({ file: 'package.json', from: import.meta.dirname });
if (!self) {
	throw new Error('Could not find self directory');
}
export const selfRoot = dirname(self);

