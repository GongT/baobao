export function camelCase(str: string) {
	return str.replace(/[\-.\/][a-z]/g, (s) => {
		return s[1].toUpperCase();
	});
}

export function ucfirst(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

export function lcfirst(str: string) {
	return str.substr(0, 1).toLowerCase() + str.substr(1);
}

export function linux_case(str: string) {
	return str.replace(/^[A-Z]/, (s) => {
		return s.toLowerCase();
	}).replace(/[A-Z]/g, (s) => {
		return '_' + s.toLowerCase();
	});
}

export function linux_case_hyphen(str: string) {
	return str.replace(/^[A-Z]/, (s) => {
		return s.toLowerCase();
	}).replace(/[A-Z]/g, (s) => {
		return '-' + s.toLowerCase();
	});
}
