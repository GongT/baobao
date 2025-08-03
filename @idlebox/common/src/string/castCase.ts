const splittersAndLower = /[-./_]+[a-z]/g;
/** @public */
export function camelCase(str: string) {
	return str
		.replace(splittersAndLower, (s) => {
			return s[1]?.toUpperCase();
		})
		.replace(spliters, '');
}

/**
 * Uppercase first char
 * @public
 */
export function ucfirst<T extends string>(str: T): Capitalize<T> {
	if (!str) return str as any;
	return <any>(str[0].toUpperCase() + str.slice(1));
}

/**
 * lowercase first char
 * @public
 */
export function lcfirst<T extends string>(str: T): Uncapitalize<T> {
	if (!str) return str as any;
	return <any>(str[0].toLowerCase() + str.slice(1));
}

const prefixCapitals = /^[A-Z]+/;
const allCapitals = /[A-Z]+/g;
const spliters = /[-./_]+/g;
/** @public */
export function linux_case(str: string) {
	return str
		.replace(prefixCapitals, (s) => {
			return s.toLowerCase();
		})
		.replace(allCapitals, (s) => {
			return `_${s.toLowerCase()}`;
		})
		.replace(spliters, '_');
}

/** @public */
export function linux_case_hyphen(str: string) {
	return str
		.replace(prefixCapitals, (s) => {
			return s.toLowerCase();
		})
		.replace(allCapitals, (s) => {
			return `-${s.toLowerCase()}`;
		})
		.replace(spliters, '-');
}
