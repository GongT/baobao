import type { IFormatter } from '../api/types.js';
import type { IInternalFile } from './filesystem.js';

const configSymbol = Symbol('@gongt/json-edit');

declare interface IAttachedData {
	formatter?: IFormatter<any>;
	formatterOptions?: any;
	fileInfo?: IInternalFile;
	keysSort: string[];
}

function _attach(data: any): IAttachedData {
	if (!data[configSymbol]) {
		data[configSymbol] = {};
	}
	return data[configSymbol];
}

export function setAttachedFormatter(data: any, format: IFormatter<any>) {
	_attach(data).formatter = format;
}

type IFRet = {
	formatter?: IFormatter<any>;
	formatterOptions: any;
};

export function getAttachedFormatter(data: any): IFRet {
	const attached = _attach(data);
	return {
		formatter: attached.formatter,
		formatterOptions: attached.formatterOptions,
	};
}

export function setAttachedFile(data: any, content: IAttachedData['fileInfo']) {
	_attach(data).fileInfo = content;
}

export function getAttachedFile(data: any): IAttachedData['fileInfo'] | undefined {
	return _attach(data).fileInfo;
}

export function setKeySort(data: any, content: IAttachedData['keysSort']) {
	_attach(data).keysSort = content;
}

export function getKeySort(data: any): IAttachedData['keysSort'] | undefined {
	return _attach(data).keysSort;
}

export function cloneAttachedFieldsInto(data: any, newData: any) {
	const prev = _attach(data);
	newData[configSymbol] = { ...prev };
	if (prev.formatter) {
		newData[configSymbol].formatter = prev.formatter.clone();
	}
}
