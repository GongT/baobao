import { dirname, resolve } from 'path';
import { IS_WINDOWS } from './argParse';

export function pushApiExtractorPath() {
	const pathSec = dirname(__dirname).split(/\bnode_modules\b/g);

	const pathList: string[] = [];
	let ppart = '/';
	for (const part of pathSec) {
		// console.log('ppart=%s, part=%s', ppart, part);
		pathList.push(resolve(ppart, 'node_modules', part, 'node_modules/.bin'));
		ppart = ppart + '/node_modules/' + part;
		// console.log('!!ppart=%s', ppart);
	}
	if (pathList.length === 0) {
		console.error('Warning: no node_modules in export-all-in-one install path (%s).', __dirname);
		return;
	}
	if (IS_WINDOWS) {
		process.env.Path += ';' + pathList.join(';');
	} else {
		process.env.PATH += ':' + pathList.join(':');
	}
}
