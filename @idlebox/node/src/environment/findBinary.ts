import type { PathArray } from '@idlebox/common';
import { resolve } from 'node:path';
import { existsSync } from '../fs/exists.js';
import { PathEnvironment } from './pathEnvironment.js';

export function findBinary(what: string, pathvar: PathArray = new PathEnvironment(), cwd = process.cwd()) {
	for (const path of pathvar.values()) {
		if (existsSync(`${path}/${what}`)) {
			return resolve(cwd, path, what);
		}
	}
	return '';
}
