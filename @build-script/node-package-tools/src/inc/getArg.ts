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

const common_args = {
	'--quiet': "don't print verbose message",
	'--registry <xxx>': 'default to use system .npmrc (must have schema)',
	'--dist-tag <xxx>': 'default to "latest"',
	'--package <xxx>': 'default to ./ (folder should contains package.json)',
};

export function pArgS(s: string) {
	return `\x1B[3;38;5;14m${s}\x1B[0m`;
}
export function pCmd(s: string) {
	return `\x1B[38;5;10m${s}\x1B[0m`;
}

export function printCommonOptions() {
	process.stderr.write(`\x1B[2mCommon Options\x1B[0m:\n`);
	process.stderr.write(formatOptions(common_args, { color: 11, indent: '  ' }));
}

interface IFormatOptions {
	color?: number;
	indent?: string;
}
export function formatOptions(args: Record<string, string>, { color, indent }: IFormatOptions = {}) {
	let r = '';
	if (!color) color = 14;
	if (!indent) indent = '';

	for (const [name, desc] of Object.entries(args)) {
		const [n, ...ex] = name.split(' ');
		if (ex.length) ex.unshift('');
		r += `${indent}\x1B[38;5;${color}m${n}\x1B[0m${ex.join(' ')}: ${desc}\n`;
	}
	return r;
}
