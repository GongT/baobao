export function isModuleResolutionError(ex: any) {
	return (
		typeof ex === 'object' &&
		!!ex &&
		'code' in ex &&
		(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND')
	);
}
