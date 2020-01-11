export function getAllPathUpToRoot(from: string, append: string = '') {
	const parts = from.split(/\/\\/g).filter(e => e);
	const dirs: string[] = [];
	let p = '';

	if (append) {
		append = '/' + append;
	}

	for (const i of parts) {
		p += '/' + i;
		dirs.push(p + append);
	}
	return dirs;
}
