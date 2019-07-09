import { access as accessAsync, readFile as readFileAsync, writeFile as writeFileAsync } from 'fs';
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

export async function writeJsonFileBackForce(data: any): Promise<void> {
	return _realWriteJsonFile(undefined, data, true);
}

export async function writeJsonFileBack(data: any): Promise<void> {
	return _realWriteJsonFile(undefined, data, false);
}

export function writeJsonFile(file: string, data: any): Promise<void> {
	return _realWriteJsonFile(file, data, true);
}

export async function writeJsonFileIfChanged(file: string, data: any, charset: string = realDefault.encoding): Promise<void> {
	if (!_getFormatInfo(data) && await access(file).then(() => true, () => false)) {
		const config = _getFormatInfo(await loadJsonFile(file, charset))!;
		attachFormatConfig(data, config);
	}
	return _realWriteJsonFile(file, data, false);
}

/** @internal */
export async function _realWriteJsonFile(_file: string | undefined, data: any, force: boolean): Promise<void> {
	const text = stringifyJsonText(data);
	const config = _getFormatInfo(data) || realDefault;

	if (!force && config.originalContent === text) {
		return;
	}

	let file = '';
	if (_file) {
		file = _file;
	} else if (config.originalPath) {
		file = config.originalPath;
	} else {
		throw new Error('This object is not load from file system.');
	}

	await writeFile(file, text, { encoding: config.encoding });
	config.originalContent = text;
	config.originalPath = resolve(process.cwd(), file);
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

export async function loadJsonFile(file: string, charset: string = realDefault.encoding!): Promise<any> {
	try {
		const text = await readFile(file, { encoding: charset });
		const data = parseJsonText(text);
		const config = _getFormatInfo(data)!;
		config.encoding = charset;
		config.originalContent = text;
		config.originalPath = resolve(process.cwd(), file);
		return data;
	} catch (e) {
		e.message += ` (while loading json file "${file}")`;
		throw e;
	}
}

export function parseJsonText(text: string): any {
	const config = parseTextFormat(text);
	const data = JSON.parse(text);
	if (typeof data !== 'object') {
		throw new Error('Scalar root object is not supported.');
	}
	attachFormatConfig(data, config);
	return data;
}

export function stringifyJsonText(data: any): string {
	const config = _getFormatInfo(data) || realDefault;
	if (config.lineFeed === LineFeed.NONE) {
		return JSON.stringify(data) + (config.lastNewLine ? '\n' : '');
	}

	let text = JSON.stringify(data, null, 1);
	text = text.replace(/^\s+/mg, (m0: string) => {
		return config.tabs.repeat(m0.length);
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
		enumerable: false,
		configurable: true,
		writable: false,
	});
}

function parseTextFormat(text: string): IFileInternalConfig {
	const lastClose = text.lastIndexOf('}');
	const findNewline = /\n/.test(text.slice(0, lastClose));
	const findSpace = /^\s+/m.exec(text);

	const config: IFileInternalConfig = {} as any;

	if (findSpace) {
		config.tabs = findSpace[0];
	} else {
		config.tabs = '';
	}
	if (findNewline) {
		config.lineFeed = /\r\n/.test(text) ? LineFeed.CRLF : LineFeed.LF;
	} else {
		config.lineFeed = LineFeed.NONE;
		config.tabs = realDefault.tabs;
	}
	config.lastNewLine = lastClose !== (text.length - 1);

	return config;
}
