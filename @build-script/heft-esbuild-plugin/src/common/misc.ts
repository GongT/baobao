export function s(num: number, nonce: string) {
	if (num > 1) {
		return `${num} ${nonce}s`;
	} else {
		return `${num} ${nonce}`;
	}
}
