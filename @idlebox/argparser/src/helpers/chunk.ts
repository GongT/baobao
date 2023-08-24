export function wrapStringBlock(str: string, width: number, padLeft: string) {
	if (width === Infinity) return str;
	return str.replace(new RegExp(`.{${width}}`, 'g'), `$0\n${padLeft}`);
}
