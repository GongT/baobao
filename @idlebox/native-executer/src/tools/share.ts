export function isModuleNotFoundError(error: any): error is { code: 'ERR_MODULE_NOT_FOUND' } {
	return error?.code === 'ERR_MODULE_NOT_FOUND';
}

export function throwIt<T>(v: T | Error): T {
	if (v instanceof Error) throw v;
	return v;
}

export function sizeOf(source: string | { readonly byteLength: number } | undefined) {
	if (!source) return 'undefined';

	if (typeof source === 'string') {
		return `${source.length} chars`;
	} else {
		return `${source.byteLength} bytes`;
	}
}
