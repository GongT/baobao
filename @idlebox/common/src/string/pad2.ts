export function pad2(s: number) {
	if (s < 10) {
		return '0' + s;
	} else {
		return '' + s;
	}
}
