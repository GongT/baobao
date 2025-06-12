import { getKeySort, setKeySort } from '../tools/attachData.js';
import { insertArrayAlphabet } from '../tools/array.js';

export enum UnorderdFieldsPlacement {
	PREPEND = 0,
	APPENND = 1,
}

export function manipulateJsonResult(data: any, oType: UnorderdFieldsPlacement = UnorderdFieldsPlacement.APPENND) {
	const keySort = getKeySort(data);
	if (!keySort) {
		return data;
	}

	const ret: any = {};
	const others: any = { ...data };

	for (const k of keySort) {
		if (k in data) {
			ret[k] = data[k];
			delete others[k];
		}
	}

	if (oType === UnorderdFieldsPlacement.APPENND) {
		return Object.assign(ret, others);
	}
	return Object.assign(others, ret);
}

export function insertKeyAlphabet(data: any, key: any, value: any): typeof data {
	let keySort = getKeySort(data);
	if (!keySort) {
		setKeySort(data, [...Object.keys(data)]);
		keySort = getKeySort(data);
	}

	if (!keySort.includes(key)) {
		insertArrayAlphabet(keySort, key);
	}

	data[key] = value;
	return data;
}

export function sortObjectWithTargetOrder(data: any, targetOrder: string[]): typeof data {
	setKeySort(data, targetOrder);
	return data;
}
