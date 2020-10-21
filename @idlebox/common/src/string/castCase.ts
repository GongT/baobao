/** @public */
export function camelCase(str: string) {
	return str.replace(/[-.\/_][a-z]/g, (s) => {
		return s[1].toUpperCase();
	});
}

/**
 * Uppercase first char
 * @public
 */
export function ucfirst(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

/**
 * Lowercase first char
 * @public
 */
export function lcfirst(str: string) {
	return str.substr(0, 1).toLowerCase() + str.substr(1);
}

/** @public */
export function linux_case(str: string) {
	return str
		.replace(/^[A-Z]/, (s) => {
			return s.toLowerCase();
		})
		.replace(/[A-Z]/g, (s) => {
			return '_' + s.toLowerCase();
		});
}

/** @public */
export function linux_case_hyphen(str: string) {
	return str
		.replace(/^[A-Z]/, (s) => {
			return s.toLowerCase();
		})
		.replace(/[A-Z]/g, (s) => {
			return '-' + s.toLowerCase();
		});
}
