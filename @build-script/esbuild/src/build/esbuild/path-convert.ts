import { resolve } from 'path';
import { normalizePath } from '@idlebox/node';
import { relative } from 'path/posix';

export class PathViolateError extends Error {}

export function getFileProject(scope: string, file: string) {
	scope = normalizePath(scope);
	file = normalizePath(file);

	const relFromScope = relative(scope, file);
	const sections = relFromScope.replace(/^\/+/, '').split(/\/+/g, 1);

	return sections[0];
}

export function builtFileMapToSource(scope: string, file: string) {
	// console.error('builtFileMapToSource(%s, %s)',scope,file)

	scope = normalizePath(scope);
	file = normalizePath(file);

	const relFromScope = relative(scope, file);
	const sections = relFromScope.replace(/^\/+/, '').split(/\/+/g);
	if (sections[1] !== 'lib') {
		throw new PathViolateError(sections[1]);
	}
	sections[1] = 'src';

	return normalizePath(resolve(scope, './' + sections.join('/')));
}

export function sourceFileMapToBuilt(scope: string, file: string) {
	scope = normalizePath(scope);
	file = normalizePath(file);

	const relFromScope = relative(scope, file);
	const sections = relFromScope.replace(/^\/+/, '').split(/\/+/g);
	if (sections[1] !== 'src') {
		throw new PathViolateError(sections[1]);
	}
	sections[1] = 'lib';

	return normalizePath(resolve(scope, './' + sections.join('/')));
}
