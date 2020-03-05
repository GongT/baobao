import 'source-map-support/register';
import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { RushProject } from '@build-script/rush-tools';
import { pathExistsSync } from 'fs-extra';
import { getopts } from './include/rushArguments';

interface IOptions {
	file: string;
	action: string;
	key: string;
	value: string;
}

const { file, action, key, value } = getopts<IOptions>();

const actionCallback = createAction();
function createAction() {
	switch (action) {
		case 'push':
			return push;
		case 'unshift':
			return unshift;
		case 'set':
			return set;
		case 'unset':
			return del;
	}
}

if (!key || !actionCallback) {
	console.error('$0 -f <file-name.json> -a <push|unshift|set|unset> -k <.path.to.prop> [-v value]');
	process.exit(1);
}
if (actionCallback !== del && !value) {
	console.error('$0 -f <file-name.json> -a <push|unshift|set|unset> -k <.path.to.prop> [-v value]');
	process.exit(1);
}
if (!key.startsWith('.')) {
	console.error('Error: key must starts with "."');
	process.exit(1);
}

function parseValue(value) {
	if (value === 'true') {
		return true;
	}
	if (value === 'false') {
		return false;
	}
	if (!isNaN(parseFloat(value))) {
		return parseFloat(value);
	}
	return value;
}
const parsedValue = parseValue(value);

let success = 0,
	fail = 0;

const rush = new RushProject();
for (const { projectFolder, packageName } of rush.projects) {
	const path = rush.absolute(projectFolder, file);

	if (!pathExistsSync(path)) {
		continue;
	}

	try {
		console.error('modify: %s', packageName, key, parsedValue);

		const json = loadJsonFileSync(path);
		const changed = actionCallback(json, key, parsedValue);
		if (changed) {
			writeJsonFileBackSync(json);
		}

		console.error('\x1B[A\x1B[K\x1B[38;5;10m✔\x1B[0m - %s', packageName);
		success++;
	} catch (e) {
		console.error(' > \x1B[38;5;9m%s\x1B[0m\x1B[K', e.message);
		console.error(' > %s', path);
		fail++;
	}
}
console.error('success: %s, fail: %s\x1B[K', success, fail);
process.exit(fail);

function pathInfo(obj, path) {
	const ps = path.split('.');
	ps.shift();
	const last = ps.pop();

	let debug = '';
	for (const part of ps) {
		debug += '.' + part;
		if (!obj.hasOwnProperty(part)) {
			// console.log('%s: object path not exists', debug);
			obj[part] = {};
		}
		obj = obj[part];
	}
	return { obj, last };
}

function mustSame(a, b) {
	if (typeof a !== typeof b) {
		throw new Error(`cannot set type ${typeof b} to a field with type ${typeof a}`);
	}
}
function push(json, path, value) {
	const { obj, last } = pathInfo(json, path);
	const arr = obj[last];
	if (arr === undefined) {
		obj[last] = [value];
		return true;
	} else if (!Array.isArray(arr)) {
		throw new Error(path + ': array required.');
	}

	if (arr.length) {
		mustSame(arr[0], value);
	}

	obj[last].push(value);
	return true;
}

function unshift(json, path, value) {
	const { obj, last } = pathInfo(json, path);
	const arr = obj[last];
	if (arr === undefined) {
		obj[last] = [value];
		return true;
	} else if (!Array.isArray(arr)) {
		throw new Error(path + ': array required.');
	}

	if (arr.length) {
		mustSame(arr[0], value);
	}

	obj[last].unshift(value);
	return true;
}

function set(json, path, value) {
	const { obj, last } = pathInfo(json, path);
	if (last in obj) {
		mustSame(obj[last], value);
	}
	obj[last] = value;
	return true;
}

function del(json, path) {
	const { obj, last } = pathInfo(json, path);
	if (last in obj) {
		if (Array.isArray(obj)) {
			obj.splice(last, 1);
		} else {
			delete obj[last];
		}
		return true;
	} else {
		return false;
	}
}
