export function objectPath(obj: object, path: string): any {
	path.split('.').every((name) => {
		return obj = (obj as any)[name];
	});
	return obj;
}
