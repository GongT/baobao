export function insertArrayAlphabet(a: string[], e: string) {
	const lkey = e.toLowerCase();
	for (let index = 0; index < a.length; index++) {
		const key = a[index];
		if (key.toLowerCase().localeCompare(lkey) >= 0) {
			a.splice(index, 0, e);
			return;
		}
	}

	a.push(e);
}
