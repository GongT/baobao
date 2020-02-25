export function promiseBool(p: Promise<any>): Promise<boolean> {
	return p.then(
		() => true,
		() => false
	);
}
