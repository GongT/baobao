import { stringify } from 'comment-json';
import { getAttachedFile, getAttachedFormatter, setAttachedFormatter } from '../tools/attachData.js';
import { defaultFormatFactory } from '../tools/formatter.js';
import { manipulateJsonResult, UnorderdFieldsPlacement } from './manipulate.js';
import type { JsonEditObject } from './types.js';

export function reformatJson<T, K>(data: JsonEditObject<T, K>, override: Partial<K>): JsonEditObject<T, K> {
	const config = getAttachedFormatter(data);
	config.formatterOptions = override;
	config.formatter?.setOptions(override);
	return data;
}

function orderedStringify(data: unknown, others: UnorderdFieldsPlacement = UnorderdFieldsPlacement.APPEND): string {
	return stringify(manipulateJsonResult(data, others), null, 2);
}

export async function stringifyJsonText(data: unknown) {
	let { formatter } = getAttachedFormatter(data);

	const str = orderedStringify(data);

	if (!formatter) {
		formatter = await defaultFormatFactory?.();
		if (!formatter) return str;
		setAttachedFormatter(data, formatter);
	}

	const file = getAttachedFile(data);
	return await formatter.format(str, file?.originalPath);
}

export function getFormatInfo<K = unknown>(data: JsonEditObject<any, K>): K {
	const { formatter, formatterOptions } = getAttachedFormatter(data);
	return formatter?.getOptions() ?? formatterOptions;
}
