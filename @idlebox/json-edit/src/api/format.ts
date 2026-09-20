import { stringify } from 'comment-json';
import { getAttachedFile, getAttachedFormatter } from '../tools/attachData.js';
import { createFormatterInstance } from '../tools/formatter.js';
import { manipulateJsonResult, UnorderdFieldsPlacement } from './manipulate.js';
import type { JsonEditObject } from './types.js';

export function reformatJson<T, K>(data: JsonEditObject<T, K>, override: Partial<K>): JsonEditObject<T, K>;
export function reformatJson<T>(data: JsonEditObject<T, any>, override: any): JsonEditObject<T, any>;
export function reformatJson<T, K>(data: T, override: Partial<K>): T {
	const config = getAttachedFormatter(data);
	config.formatterOptions = override;
	config.formatter?.setOptions(override);
	return data;
}

function orderedStringify(data: any, others: UnorderdFieldsPlacement = UnorderdFieldsPlacement.APPEND): string {
	return stringify(manipulateJsonResult(data, others), null, 2);
}

export async function stringifyJsonText(data: any) {
	let { formatter } = getAttachedFormatter(data);

	const str = orderedStringify(data);

	const file = getAttachedFile(data);

	if (!formatter) {
		formatter = await createFormatterInstance(str, file?.originalPath);
	}

	return await formatter.format(str, file?.originalPath);
}

export function getFormatInfo<K>(data: JsonEditObject<any, K>): K;
export function getFormatInfo(data: JsonEditObject<any, any>): any;
export function getFormatInfo<K>(data: JsonEditObject<any, K>): K {
	const { formatter, formatterOptions } = getAttachedFormatter(data);
	return formatter?.getOptions() ?? formatterOptions;
}
