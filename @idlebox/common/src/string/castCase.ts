/** @public */
export function camelCase(str: string) {
	return str
		.replace(/[-.\/_]+[a-z]/g, (s) => {
			return s[1]!.toUpperCase();
		})
		.replace(/[-.\/_]+/g, '');
}

/**
 * Uppercase first char
 * @public
 */
export function ucfirst<T extends string>(str: T): Capitalize<T> {
	return <any>(str[0]!.toUpperCase() + str.slice(1));
}

/**
 * lowercase first char
 * @public
 */
export function lcfirst<T extends string>(str: T): Uncapitalize<T> {
	return <any>(str[0]!.toLowerCase() + str.slice(1));
}

/** @public */
export function linux_case(str: string) {
	return str
		.replace(/^[A-Z]+/, (s) => {
			return s.toLowerCase();
		})
		.replace(/[A-Z]+/g, (s) => {
			return '_' + s.toLowerCase();
		})
		.replace(/[-.\/_]+/g, '_');
}

/** @public */
export function linux_case_hyphen(str: string) {
	return str
		.replace(/^[A-Z]/, (s) => {
			return s.toLowerCase();
		})
		.replace(/[A-Z]+/g, (s) => {
			return '-' + s.toLowerCase();
		})
		.replace(/[-.\/_]+/g, '-');
}
