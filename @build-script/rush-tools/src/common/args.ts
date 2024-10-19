import { ArgumentError, type ISubArgsReaderApi } from '@idlebox/args';

export interface ArgumentBaseType {}

export function createArgsDefine() {}

export function requiredArg<T>(name: string, value: T | undefined): T {
	if (value === undefined) {
		throw new ArgumentError(`missing required argument: ${name}`);
	}
	return value;
}

export function limitEnum<T>(enumMap: Record<string, T>, value: string): Exclude<T, 'string'> {
	if (Object.hasOwn(enumMap, value)) {
		return enumMap[value] as any;
	}
	throw new ArgumentError(`invalid value ${value}`);
}
export type ArgOf<Import> = Import extends { parse(subcmd: ISubArgsReaderApi): infer T } ? T : never;
