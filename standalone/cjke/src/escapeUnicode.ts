export function unicodeEscape(str: string) {
	return str.replace(/[\s\S]/g, (escape) => `\\u${(`0000${escape.charCodeAt(0).toString(16)}`).slice(-4)}`);
}
