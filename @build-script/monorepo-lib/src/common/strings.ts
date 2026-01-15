const slashes = /\//g;
export function normalizePackageName(name: string, sep = '-') {
	if (name[0] === '@') {
		return name.slice(1).replace(slashes, sep);
	} else {
		return name;
	}
}
