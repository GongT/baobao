export function handleShort<T>(input: T, names: (keyof T)[]): T {
	for (const i of names as string[]) {
		const f = i.slice(0, 1);
		if (input.hasOwnProperty(f)) {
			if (input[i]) {
				throw new Error(`duplicate argument: ${f} and ${i}`);
			}
			input[i] = input[f];
		}
	}
	return input;
}
export function getopts<T>(argv = process.argv.slice(2)): T {
	let opts: any = {};
	for (let index = 0; index < argv.length; index++) {
		const item = argv[index];
		if (!item.startsWith('-')) {
			throw new Error('Unknown argument: ' + item);
		}
		const name = item.replace(/^-+/, '');

		const next = argv[index + 1];
		if (next.startsWith('-')) {
			opts[name] = true;
		} else {
			opts[name] = next;
			index++;
		}
	}
	return opts;
}
