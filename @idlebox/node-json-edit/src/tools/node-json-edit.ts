import { parse, stringify } from 'comment-json';
import {
	access as accessAsync,
	accessSync,
	readFile as readFileAsync,
	readFileSync,
	writeFile as writeFileAsync,
	writeFileSync,
} from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { resolveConfig, format } from 'prettier';

const access = promisify(accessAsync);
const readFile = promisify(readFileAsync);
const writeFile = promisify(writeFileAsync);

/** @internal */
interface IFileInternalConfig extends IFileFormatConfig {
	originalContent?: string;
	originalPath?: string;
	encoding: BufferEncoding;
}

export async function writeJsonFileIfChanged(file: string, data: any, charset: BufferEncoding = realDefault.encoding) {
	if (
		!_getFormatInfo(data) &&
		(await access(file).then(
			() => true,
			() => false
		))
	) {
		const config = _getFormatInfo(await loadJsonFile(file, charset))!;
		attachFormatConfig(data, config);
	}
	return _realWriteJsonFile(file, data, false);
}

function _realWriteJsonFileP(
	_file: string | undefined,
	data: any,
	force: boolean
): [true, { config: IFileInternalConfig; file: string; text: string }];
function _realWriteJsonFileP(_file: string | undefined, data: any, force: boolean): [false, {}];
function _realWriteJsonFileP(
	_file: string | undefined,
	data: any,
	force: boolean
): [boolean, { config?: IFileInternalConfig; file?: string; text?: string }] {
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

export async function loadJsonFileIfExists(
	file: string,
	defaultValue: any = {},
	charset: BufferEncoding = realDefault.encoding!
): Promise<any> {
	if (
		await access(file).then(
			() => true,
			() => false
		)
	) {
		return loadJsonFile(file, charset);
	} else {
		const ret: any = JSON.parse(JSON.stringify(defaultValue));
		attachFormatConfig(ret, { ...realDefault, encoding: charset, originalContent: '', originalPath: file });
		return ret;
	}
}

function _loadJsonFile(e: null, text: string, charset: BufferEncoding, file: string): void;
function _loadJsonFile(e: Error): void;
function _loadJsonFile(e: Error | null, text?: string, charset?: BufferEncoding, file?: string) {
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

export function loadJsonFileSync(file: string, charset: BufferEncoding = realDefault.encoding!): any {
	try {
		const text = readFileSync(file, { encoding: charset });
		return _loadJsonFile(null, text, charset, file);
	} catch (e) {
		_loadJsonFile(e);
	}
}

export async function loadJsonFile(file: string, charset: BufferEncoding = realDefault.encoding!): Promise<any> {
	return readFile(file, { encoding: charset }).then(
		(data) => {
			return _loadJsonFile(null, data, charset, file);
		},
		(e) => {
			_loadJsonFile(e);
		}
	);
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

export function getFormatInfo(data: any): IFileFormatConfig | undefined {
	return _getFormatInfo(data);
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

function parseTextFormat(text: string): IFileInternalConfig {}
