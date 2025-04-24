export function escapePackageNameToFilename(name: string) {
	if (name.startsWith('@')) {
		return name.slice(1).replace('/', '__');
	}
	return name;
}
