const slashes = /\//g;
export function normalizePackageName(name: string) {
	if (name[0] === '@') {
		return name.slice(1).replace(slashes, '-');
	} else {
		return name;
	}
}
