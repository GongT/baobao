import { ImpossibleError } from '@idlebox/errors';

export function mustNonNull<T>(value: T): NonNullable<T> {
	if (value === null || value === undefined) {
		throw new ImpossibleError('异常 null 或 undefined 值');
	}
	return value;
}
