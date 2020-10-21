/**
 * resolve with true when `p` resolve
 * resolve with false when `p` reject (and drop error)
 */
export function promiseBool(p: Promise<any>): Promise<boolean> {
	return p.then(
		() => true,
		() => false
	);
}
