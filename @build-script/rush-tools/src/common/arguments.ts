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
			ret[name] = true;
		} else {
			const name = item.slice(2, eqSign);
			const value = item.slice(eqSign + 1);
			ret[name] = value;
		}
	}
	return ret;
}

const used = new Set<string>();

let options: any;
function parseArgumentsOnce(): Record<string, string> {
	if (!options) options = parseArguments();
	return options;
}
export function requirePositionalArguments(count: number, noMore = true): string[] {}

export function requireArgumentInteger(name: string, errorMsg: string): number {
	const options = requireArgument(name);
}
export function requireArgument(name: string, errorMsg: string): string {
	const value = optionalArgument(name);
	if (value === undefined) {
		throw new Error(`missing argument: [--${name}=%s] ${errorMsg}`);
	} else {
		return value;
	}
}

export function optionalArgument(name: string): string | undefined {
	const options = parseArgumentsOnce();
	if ( options[name]===undefined) {
		return undefined;
	}else if(typeof options[name] === 'string'){
		return options[name];
	} else {
		throw new Error(`invalid argument: [--${name}=] require a value`);
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
			description,
		);
	}

	process.exit(2);
}
