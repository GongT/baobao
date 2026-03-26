export function firstOf(...errors: (Error | undefined)[]) {
	for (const e of errors) {
		if (e) return e;
	}
	return undefined;
}

export function someOf(...disableds: (boolean | undefined)[]) {
	for (const d of disableds) {
		if (d) return true;
	}
	return false;
}
