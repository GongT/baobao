export function getArg(name: string, def: string) {
	const found = process.argv.indexOf(name);
	if (found === -1) {
		return def;
	}

	const ret = process.argv[found + 1];
	if (ret === undefined || ret.startsWith('-')) {
		throw new Error(`Argument ${name} should have value.`);
	}
	return ret;
}
