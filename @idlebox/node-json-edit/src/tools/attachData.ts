import type { IInternalFile } from './filesystem.js';
import { PrettyFormat } from './prettyFormat.js';

const configSymbol = Symbol('@gongt/node-json-edit');

declare interface IAttachedData {
	formatInfo: PrettyFormat;
	fileInfo: IInternalFile;
	keysSort: string[];
}

export function setAttachedFormat(data: any, format: IAttachedData['formatInfo']) {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	data[configSymbol].formatInfo = format;
}

export function getAttachedFormat(data: any): IAttachedData['formatInfo'] {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	if (!data[configSymbol].formatInfo) {
		data[configSymbol].formatInfo = new PrettyFormat();
	}
	return data[configSymbol].formatInfo;
}

export function setAttachedFile(data: any, content: IAttachedData['fileInfo']) {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	data[configSymbol].fileInfo = content;
}

export function getAttachedFile(data: any): IAttachedData['fileInfo'] | undefined {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	return data[configSymbol].fileInfo;
}

export function setKeySort(data: any, content: IAttachedData['keysSort']) {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	data[configSymbol].keysSort = content;
}

export function getKeySort(data: any): IAttachedData['keysSort'] {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	return data[configSymbol].keysSort;
}

export function cloneAttachedFieldsInto(data: any, newData: any) {
	getAttachedFormat(data); // ensure `data[configSymbol]` exists
	newData[configSymbol] = { ...data[configSymbol] };
}
