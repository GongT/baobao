import { resolve } from 'path';
import { eachProject, getCurrentRushRootPath } from '@idlebox/rush-tools';
import { pathExistsSync } from 'fs-extra';
import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';

const action = createAction();
function createAction() {
	switch (process.argv[3]) {
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

const file = process.argv[2];
const key = process.argv[4];
let value = process.argv[5];

if (undefined === key || undefined === action) {
	console.error('$0 <file-name.json> <push|unshift|set|unset> <.path.to.prop> [value]');
	process.exit(1);
}
if (action !== del && value === undefined) {
	console.error('$0 <file-name.json> <push|unshift|set|unset> <.path.to.prop> [value]');
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
value = parseValue(value);

let success = 0,
	fail = 0;

const root = getCurrentRushRootPath();
for (const { projectFolder, packageName } of eachProject()) {
	const path = resolve(root, projectFolder, file);

	if (!pathExistsSync(path)) {
		continue;
	}

	try {
		console.error('modify: %s', packageName, key, value);

		const json = loadJsonFileSync(path);
		action(json, key, value);
		writeJsonFileBackSync(json);

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
		if (obj.hasOwnProperty(part)) {
			obj = obj[part];
		} else {
			console.log('%s: object path not exists', debug);
		}
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
	if (!Array.isArray(arr)) {
		throw new Error(path + ': array required.');
	}

	if (arr.length) {
		mustSame(arr[0], value);
	}

	obj[last].push(value);
}

function unshift(json, path, value) {
	const { obj, last } = pathInfo(json, path);
	const arr = obj[last];
	if (!Array.isArray(arr)) {
		throw new Error(path + ': array required.');
	}

	if (arr.length) {
		mustSame(arr[0], value);
	}

	obj[last].unshift(value);
}

function set(json, path, value) {
	const { obj, last } = pathInfo(json, path);
	if (last in obj) {
		mustSame(obj[last], value);
	}
	obj[last] = value;
}

function del(json, path) {
	const { obj, last } = pathInfo(json, path);
	if (last in obj) {
		delete obj[last];
	} else {
		throw new Error(path + ': not exists.');
	}
}
