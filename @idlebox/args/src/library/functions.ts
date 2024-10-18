export const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export type Writable<T> = { -readonly [K in keyof T]: T[K] };
export function writable<T>(arg: T): Writable<T> {
	return arg as any;
}

export function wrapStyle(active: boolean | undefined, prefix: string, value: string, suffix: string) {
	return active ? `\x1B[${prefix}m${value}\x1B[${suffix}m` : value;
}
