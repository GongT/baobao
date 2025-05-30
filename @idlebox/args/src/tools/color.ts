export const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

export function wrapStyle(active: boolean | undefined, prefix: string, value: string, suffix: string) {
	return active ? `\x1B[${prefix}m${value}\x1B[${suffix}m` : value;
}
