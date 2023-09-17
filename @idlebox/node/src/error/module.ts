type NodeError<T> = { code: T } & Error;
export function isModuleResolutionError(ex: any): ex is NodeError<'MODULE_NOT_FOUND' | 'ERR_MODULE_NOT_FOUND'> {
	return (
		typeof ex === 'object' &&
		!!ex &&
		'code' in ex &&
		(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND')
	);
}
