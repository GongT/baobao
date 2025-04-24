export function s(num: number, nonce: string) {
	if (num > 1) {
		return `${num} ${nonce}s`;
	}
	return `${num} ${nonce}`;
}
