'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getFormatInfo =
	exports.parseJsonText =
	exports.loadJsonFile =
	exports.loadJsonFileSync =
	exports.loadJsonFileIfExists =
	exports.writeJsonFileIfChanged =
		void 0;
const comment_json_1 = require('comment-json');
const fs_1 = require('fs');
const path_1 = require('path');
const util_1 = require('util');
const access = util_1.promisify(fs_1.access);
const readFile = util_1.promisify(fs_1.readFile);
const writeFile = util_1.promisify(fs_1.writeFile);
async function writeJsonFileIfChanged(file, data, charset = realDefault.encoding) {
	if (
		!_getFormatInfo(data) &&
		(await access(file).then(
			() => true,
			() => false
		))
	) {
		const config = _getFormatInfo(await loadJsonFile(file, charset));
		attachFormatConfig(data, config);
	}
	return _realWriteJsonFile(file, data, false);
}
exports.writeJsonFileIfChanged = writeJsonFileIfChanged;
function _realWriteJsonFileP(_file, data, force) {
	const text = stringifyJsonText(data);
	const config = _getFormatInfo(data) || realDefault;
	if (!force && config.originalContent === text) {
		return [false, {}];
	}
	let file = '';
	if (_file) {
		file = _file;
	} else if (config.originalPath) {
		file = config.originalPath;
	} else {
		throw new Error('This object is not load from file system.');
	}
	return [true, { config, file, text }];
}
function _realWriteJsonFileE(config, text, file) {
	config.originalContent = text;
	config.originalPath = path_1.resolve(process.cwd(), file);
}
function _realWriteJsonFileSync(_file, data, force) {
	const [change, { config, file, text }] = _realWriteJsonFileP(_file, data, force);
	if (!change) {
		return false;
	}
	fs_1.writeFileSync(file, text, { encoding: config.encoding });
	_realWriteJsonFileE(config, text, file);
	return true;
}
async function _realWriteJsonFile(_file, data, force) {
	const [change, { config, file, text }] = _realWriteJsonFileP(_file, data, force);
	if (!change) {
		return false;
	}
	await writeFile(file, text, { encoding: config.encoding });
	_realWriteJsonFileE(config, text, file);
	return true;
}
async function loadJsonFileIfExists(file, defaultValue = {}, charset = realDefault.encoding) {
	if (
		await access(file).then(
			() => true,
			() => false
		)
	) {
		return loadJsonFile(file, charset);
	} else {
		const ret = JSON.parse(JSON.stringify(defaultValue));
		attachFormatConfig(ret, { ...realDefault, encoding: charset, originalContent: '', originalPath: file });
		return ret;
	}
}
exports.loadJsonFileIfExists = loadJsonFileIfExists;
function _loadJsonFile(e, text, charset, file) {
	if (e) {
		e.message += ` (while loading json file "${file}")`;
		throw e;
	}
	const data = parseJsonText(text);
	const config = _getFormatInfo(data);
	config.encoding = charset;
	config.originalContent = text;
	config.originalPath = path_1.resolve(process.cwd(), file);
	return data;
}
function loadJsonFileSync(file, charset = realDefault.encoding) {
	try {
		const text = fs_1.readFileSync(file, { encoding: charset });
		return _loadJsonFile(null, text, charset, file);
	} catch (e) {
		_loadJsonFile(e);
	}
}
exports.loadJsonFileSync = loadJsonFileSync;
async function loadJsonFile(file, charset = realDefault.encoding) {
	return readFile(file, { encoding: charset }).then(
		(data) => {
			return _loadJsonFile(null, data, charset, file);
		},
		(e) => {
			_loadJsonFile(e);
		}
	);
}
exports.loadJsonFile = loadJsonFile;
function parseJsonText(text) {
	const config = parseTextFormat(text);
	const data = comment_json_1.parse(text);
	if (typeof data !== 'object') {
		throw new Error('Scalar root object is not supported.');
	}
	attachFormatConfig(data, config);
	return data;
}
exports.parseJsonText = parseJsonText;
function getFormatInfo(data) {
	return _getFormatInfo(data);
}
exports.getFormatInfo = getFormatInfo;
function attachFormatConfig(data, config) {
	delete data[configSymbol];
	Object.defineProperty(data, configSymbol, {
		value: config,
		enumerable: true,
		configurable: true,
		writable: false,
	});
}
function parseTextFormat(text) {}
//# sourceMappingURL=node-json-edit.js.map
