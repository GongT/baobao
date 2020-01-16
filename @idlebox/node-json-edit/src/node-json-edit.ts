import { parse, stringify } from 'comment-json';
import { access as accessAsync, accessSync, readFile as readFileAsync, readFileSync, writeFile as writeFileAsync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';

const access = promisify(accessAsync);
const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);

const configSymbol = Symbol('@gongt/node-json-edit');

export enum LineFeed {
	NONE,
	CRLF,
	LF,
}

/** @internal */
interface IFileInternalConfig extends IFileFormatConfig {
	originalContent?: string;
	originalPath?: string;
	encoding: string;
}

export interface IFileFormatConfig {
	tabs: string;
	lineFeed: LineFeed;
	lastNewLine: boolean;
}

const realDefault: IFileInternalConfig = {
	tabs: '\t',
	lineFeed: LineFeed.LF,
	lastNewLine: true,
	encoding: 'utf8',
};
export const defaultJsonFormatConfig: IFileFormatConfig = realDefault;

export function writeJsonFileBackForceSync(data: any) {
	return _realWriteJsonFileSync(undefined, data, true);
}

export function writeJsonFileBackForce(data: any) {
	return _realWriteJsonFile(undefined, data, true);
}

export function writeJsonFileBackSync(data: any) {
	return _realWriteJsonFileSync(undefined, data, false);
}

export function writeJsonFileBack(data: any) {
	return _realWriteJsonFile(undefined, data, false);
}

export function writeJsonFileSync(file: string, data: any) {
	return _realWriteJsonFileSync(file, data, true);
}

export function writeJsonFile(file: string, data: any) {
	return _realWriteJsonFile(file, data, true);
}

function pathExistsSync(file: string) {
	try {
		accessSync(file);
		return true;
	} catch (e) {
		return false;
	}
}

export function writeJsonFileIfChangedSync(file: string, data: any, charset: string = realDefault.encoding) {
	if (!_getFormatInfo(data)) {
		const willLoad = pathExistsSync(file);
		if (willLoad) {
			const config = _getFormatInfo(loadJsonFileSync(file, charset))!;
			attachFormatConfig(data, config);
		}
	}
	return _realWriteJsonFileSync(file, data, false);
}

export async function writeJsonFileIfChanged(file: string, data: any, charset: string = realDefault.encoding) {
	if (!_getFormatInfo(data) && await access(file).then(() => true, () => false)) {
		const config = _getFormatInfo(await loadJsonFile(file, charset))!;
		attachFormatConfig(data, config);
	}
	return _realWriteJsonFile(file, data, false);
}

function _realWriteJsonFileP(_file: string | undefined, data: any, force: boolean): [true, { config: IFileInternalConfig; file: string; text: string; }]
function _realWriteJsonFileP(_file: string | undefined, data: any, force: boolean): [false, {}]
function _realWriteJsonFileP(_file: string | undefined, data: any, force: boolean): [boolean, { config?: IFileInternalConfig; file?: string; text?: string; }] {
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

function _realWriteJsonFileE(config: IFileInternalConfig, text: string, file: string) {
	config.originalContent = text;
	config.originalPath = resolve(process.cwd(), file);
}

function _realWriteJsonFileSync(_file: string | undefined, data: any, force: boolean) {
	const [change, { config, file, text }] = _realWriteJsonFileP(_file, data, force);
	if (!change) {
		return false;
	}
	writeFileSync(file, text, { encoding: config.encoding });
	_realWriteJsonFileE(config, text, file);
	return true;
}

async function _realWriteJsonFile(_file: string | undefined, data: any, force: boolean): Promise<boolean> {
	const [change, { config, file, text }] = _realWriteJsonFileP(_file, data, force);
	if (!change) {
		return false;
	}
	await writeFile(file, text, { encoding: config.encoding });
	_realWriteJsonFileE(config, text, file);
	return true;
}

export async function loadJsonFileIfExists(file: string, defaultValue: any = {}, charset: string = realDefault.encoding!): Promise<any> {
	if (await access(file).then(() => true, () => false)) {
		return loadJsonFile(file, charset);
	} else {
		const ret: any = JSON.parse(JSON.stringify(defaultValue));
		attachFormatConfig(ret, { ...realDefault, encoding: charset, originalContent: '', originalPath: file });
		return ret;
	}
}

function _loadJsonFile(e: null, text: string, charset: string, file: string): void;
function _loadJsonFile(e: Error): void;
function _loadJsonFile(e: Error | null, text?: string, charset?: string, file?: string) {
	if (e) {
		e.message += ` (while loading json file "${file}")`;
		throw e;
	}
	const data = parseJsonText(text!);
	const config = _getFormatInfo(data)!;
	config.encoding = charset!;
	config.originalContent = text!;
	config.originalPath = resolve(process.cwd(), file!);
	return data;
}

export function loadJsonFileSync(file: string, charset: string = realDefault.encoding!): any {
	try {
		const text = readFileSync(file, { encoding: charset });
		return _loadJsonFile(null, text, charset, file);
	} catch (e) {
		_loadJsonFile(e);
	}
}

export async function loadJsonFile(file: string, charset: string = realDefault.encoding!): Promise<any> {
	return readFile(file, { encoding: charset }).then((data) => {
		return _loadJsonFile(null, data, charset, file);
	}, (e) => {
		_loadJsonFile(e);
	});
}

export function parseJsonText(text: string): any {
	const config = parseTextFormat(text);
	const data = parse(text);
	if (typeof data !== 'object') {
		throw new Error('Scalar root object is not supported.');
	}
	attachFormatConfig(data, config);
	return data;
}

export function stringifyJsonText(data: any): string {
	const config = _getFormatInfo(data) || realDefault;
	if (config.lineFeed === LineFeed.NONE) {
		return stringify(data) + (config.lastNewLine ? '\n' : '');
	}

	let text = stringify(data, null, 8);
	text = text.replace(/^( {8})+/mg, (m0: string) => {
		return config.tabs.repeat(m0.length / 8);
	});

	if (config.lineFeed === LineFeed.CRLF) {
		text = text.replace(/\n/g, '\r\n');
		if (config.lastNewLine) {
			text += '\r\n';
		}
	} else {
		if (config.lastNewLine) {
			text += '\n';
		}
	}

	return text;
}

export function insertKeyAlphabet<T = any>(obj: T, key: any, value: any): T {
	if (key in obj) {
		(obj as any)[key] = value;
		return obj;
	}

	const keys = Object.keys(obj);
	const saveObj = {} as any;

	const lkey = key.toLowerCase();
	let i;
	for (i = 0; i < keys.length; i++) {
		if (keys[i].toLowerCase().localeCompare(lkey) >= 0) {
			break;
		}
	}
	for (let j = i; j < keys.length; j++) {
		saveObj[keys[j]] = (obj as any)[keys[j]];
		delete (obj as any)[keys[j]];
	}
	(obj as any)[key] = value;
	for (let j = i; j < keys.length; j++) {
		(obj as any)[keys[j]] = saveObj[keys[j]];
	}

	return obj;
}

export function reformatJson<T = any>(data: T, format: Partial<IFileFormatConfig>): T {
	const config = _getFormatInfo(data);
	if (config) {
		Object.assign(config, format);
	} else {
		attachFormatConfig(data, { ...realDefault, ...format });
	}
	return data;
}

function _getFormatInfo(data: any): IFileInternalConfig | undefined {
	return data[configSymbol];
}

export function getFormatInfo(data: any): IFileFormatConfig | undefined {
	return data[configSymbol];
}

function attachFormatConfig(data: any, config: IFileInternalConfig) {
	delete data[configSymbol];
	Object.defineProperty(data, configSymbol, {
		value: config,
		enumerable: true,
		configurable: true,
		writable: false,
	});
}

function parseTextFormat(text: string): IFileInternalConfig {
	const lastClose = text.lastIndexOf('}');
	const findNewline = /\n/.test(text.slice(0, lastClose));
	const spaceCounting: { [space: string]: number } = {};
	text.split(/\n|\r/g).forEach((s) => {
		const fc = s[0];
		if (/^\s$/.test(fc)) {
			spaceCounting[fc] = spaceCounting[fc] ? 1 : spaceCounting[fc] + 1;
		}
	});
	let maxVal: number = 0;
	let findSpace = realDefault.tabs;
	Object.entries(spaceCounting).forEach(([space, count]) => {
		if (count > maxVal) {
			findSpace = space;
			maxVal = count;
		}
	});

	const config: IFileInternalConfig = {} as any;

	config.tabs = findSpace;
	if (findNewline) {
		config.lineFeed = /\r\n/.test(text) ? LineFeed.CRLF : LineFeed.LF;
	} else {
		config.lineFeed = LineFeed.NONE;
		config.tabs = realDefault.tabs;
	}
	config.lastNewLine = lastClose !== (text.length - 1);

	return config;
}
