function parseArguments() {
	const ret: Record<string, string | boolean> = {};
	const args = process.argv.slice(2);
	let item: string | undefined;
	while ((item = args.shift())) {
		if (!item.startsWith('--')) {
			throw new Error(`Invalid argument: ${item}`);
		}
		const eqSign = item.indexOf('=');
		if (eqSign === -1) {
			const name = item.slice(2);
			const next = args[0];
			if (next && !next.startsWith('--')) {
				ret[name] = next;
				args.shift();
			} else {
				ret[name] = true;
			}
		} else {
			const name = item.slice(2, eqSign);
			const value = item.slice(eqSign + 1);
			ret[name] = value;
		}
	}
	return ret;
}

let options: any;
function parseArguments1(): Record<string, string> {
	if (!options) options = parseArguments();
	return options;
}

export function requireArgument(name: string): string {
	const options = parseArguments1();
	if (typeof options[name] === 'string' && options[name]) {
		return options[name];
	} else {
		console.log(options);
		throw new Error(`missing argument: --${name}`);
	}
}

export function optionalArgument(name: string): string | undefined {
	const options = parseArguments1();
	if (typeof options[name] === 'string' && options[name]) {
		return options[name];
	} else {
		console.log(options);
		throw new Error(`missing argument: --${name}`);
	}
}

export function shiftArgumentFlag(argv: string[], flag: string): boolean {
	const found = argv.indexOf('--' + flag);
	if (found === -1) return false;
	argv.splice(found, 1);
	return true;
}

export interface IArgumentsDefine {
	name: string;
	optional?: boolean;
	description: string;
}

export function argumentError(message: string, argMap: IArgumentsDefine[]): never {
	if (!process.env.__running_command) {
		throw new Error(message);
	}

	console.error('\n\x1B[38;5;9mArgumentError: %s\x1B[0m\n', message);

	const maxLen = argMap.reduce((p, { name }) => Math.max(p, name.length), 0);

	console.error('Usage: rush-tools %s \\', process.env.__running_command);
	for (const { name, description, optional } of argMap) {
		console.error(
			'    %s%s%s%s  %s',
			optional ? '[' : '',
			name,
			optional ? '[' : '',
			Buffer.alloc(maxLen - name.length, ' ').toString(),
			description
		);
	}

	process.exit(2);
}
