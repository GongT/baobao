export function insertArrayAlphabet(a: string[], e: string) {
	const lkey = e.toLowerCase();
	for (const [index, key] of a.entries()) {
		if (key.toLowerCase().localeCompare(lkey) >= 0) {
			a.splice(index, 0, e);
			return;
		}
	}

	a.push(e);
}
