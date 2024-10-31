import { RushProject } from '@build-script/rush-tools';
import { loadJsonFile, writeJsonFileBack } from '@idlebox/node-json-edit';
import { existsSync } from 'fs';
import '../include/prefix';
import { getopts, handleShort } from '../include/rushArguments';

interface IOptions {
	file: string;
	action: string;
	key: string;
	value: string;
}

const { file, action, key, value } = handleShort(getopts<IOptions>(), ['file', 'action', 'key', 'value']);
console.log({ file, action, key, value });

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
		default:
			printUsage('Action is required');
	}
}

if (!key || !actionCallback) {
	printUsage('Key is required');
}
if (actionCallback !== del && !value) {
	printUsage('Value is required (except delete)');
}
if (!key.startsWith('.')) {
	printUsage('Error: key must starts with "."');
}

function printUsage(err: string): never {
	console.error(err);
	console.error('$0 -f <file-name.json> -a <push|unshift|set|unset> -k <.path.to.prop> [-v value]');
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
main();
async function main() {
	for (const { projectFolder, packageName } of rush.projects) {
		const path = rush.absolute(projectFolder, file);

		if (!existsSync(path)) {
			continue;
		}

		try {
			console.error('modify: %s', packageName, key, parsedValue);

			const json = await loadJsonFile(path);
			const changed = actionCallback(json, key, parsedValue);
			if (changed) {
				await writeJsonFileBack(json);
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
}

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
