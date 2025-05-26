import { createArgsReader } from '@idlebox/args';

export class DieError extends Error {
	constructor(msg: string) {
		super(msg);
		this.stack = this.message;
	}
}
function die(msg: string) {
	throw new DieError(msg);
}

export const argv = createArgsReader(process.argv.slice(2));

const common_args = {
	'--quiet': '减少输出',
	'--registry <xxx>': 'npm服务器，默认从.npmrc读取(必须有schema://)',
	'--dist-tag <xxx>': '需要从服务器读取时使用的tag，默认为"latest"',
	'--package <xxx>': '实际操作前，更改当前目录（此文件夹应包含package.json）',
	'--json': '输出json格式（部分命令支持）',
	'--help': '显示帮助信息',
};

export const isVerbose = argv.flag('--verbose') > 0;
export const isQuiet = argv.flag(['--silent', '-s', '--quiet']) > 0;
export const isJsonOutput = argv.flag('--json') > 0;
export const isHelp = argv.flag(['--help', '-h']) > 0;
export const distTagInput = argv.single('--dist-tag') || 'latest';
export const registryInput = argv.single('--registry') || 'detect';
export const isDebugMode = argv.flag('--debug') > 0;

if (isVerbose && isQuiet) {
	die('不能同时使用 --verbose 和 --quiet');
}

export function pArgS(s: string) {
	return `\x1B[3;38;5;14m${s}\x1B[0m`;
}
export function pDesc(s: string) {
	return `\x1B[3;2m${s}\x1B[0m`;
}
export function pCmd(s: string) {
	return `\x1B[38;5;10m${s}\x1B[0m`;
}

export function printCommonOptions() {
	process.stderr.write('\x1B[2m通用参数\x1B[0m:\n');
	process.stderr.write(formatOptions(common_args, { color: 3, indent: '  ' }));
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
