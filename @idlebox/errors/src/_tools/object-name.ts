interface MaybeNamed {
	readonly name?: string;
	readonly displayName?: string;
}

/**
 * @internal
 */
export function objectName<T = unknown>(func: NonNullable<T>) {
	return (func as MaybeNamed).displayName || (func as MaybeNamed).name;
}
