import { stringify } from 'comment-json';
import { doc, Options as PrettierOptions } from 'prettier';
import { getAttachedFormat } from '../tools/attachData';
import { manipulateJsonResult, UnorderdFieldsPlacement } from './manipulate';

type PassedEditableFormats = 'bracketSpacing' | 'endOfLine';
export interface IFileFormatConfig extends doc.printer.Options, Pick<PrettierOptions, PassedEditableFormats> {
	lastNewLine: boolean;
}

export function reformatJson<T = any>(data: T, format: Partial<IFileFormatConfig>): T {
	const config = getAttachedFormat(data);
	config.setFormat(format);
	return data;
}

function orderdStringify(data: any, others: UnorderdFieldsPlacement = UnorderdFieldsPlacement.APPENND): string {
	return stringify(manipulateJsonResult(data, others), null, 2);
}

export function stringifyJsonText(data: any): string {
	const config = getAttachedFormat(data);
	const str = orderdStringify(data);
	return config.format(str);
}

export function getFormatInfo(data: any): IFileFormatConfig {
	const config = getAttachedFormat(data);
	return config.toJSON();
}
