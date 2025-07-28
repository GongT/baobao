import { createArgsReader } from '@idlebox/args';

export const CSI = '\x1b[';

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

type ArgDefine = {
	flag: boolean;
	description: string;
};
const common_args = {
	quiet: { flag: true, description: '减少输出' },
	registry: { flag: false, description: 'npm服务器，默认从.npmrc读取(必须有schema://)' },
	'dist-tag': { flag: false, description: '需要从服务器读取时使用的tag，默认为"latest"' },
	package: { flag: false, description: '实际操作前，更改当前目录（此文件夹应包含package.json）' },
	json: { flag: true, description: '输出json格式（部分命令支持）' },
	help: { flag: true, description: '显示帮助信息' },
};
type CommonArgs = keyof typeof common_args;
const all_common_args = Object.keys(common_args) as ReadonlyArray<CommonArgs>;

export abstract class CommandDefine {
	/**
	 * 紧接在命令后面的参数
	 */
	protected abstract readonly _usage: string;
	/**
	 * usage后面的简短说明
	 */
	protected abstract readonly _description: string;
	/**
	 * 多行详细帮助信息
	 */
	protected abstract readonly _help: string;
	/**
	 * 独特命令行参数
	 */
	protected readonly _arguments?: Record<string, ArgDefine>;
	/**
	 * 通用命令行参数
	 */
	protected readonly _commonArgs?: readonly CommonArgs[];

	public readonly isHidden: boolean = false;

	get help() {
		let r = this._help;
		if (this._arguments) {
			const opts = formatOptions(this._arguments);
			if (r) r += '\n';
			r += opts;
		}
		return r;
	}

	get usage() {
		return this._usage;
	}
	get description() {
		return this._description;
	}
	get commonArgs() {
		return this._commonArgs;
	}
}

export const isQuiet = argv.flag(['--silent', '-s', '--quiet']) > 0;
export const isJsonOutput = argv.flag('--json') > 0;
export const isHelp = argv.flag(['--help', '-h']) > 0;
export const distTagInput = argv.single('--dist-tag') || 'latest';
export const registryInput = argv.single('--registry') || 'detect';
export const isDebugMode = argv.flag(['--debug', '-d']) > 0;
export const isVerbose = argv.flag(['--debug', '-d']) > 1;

if (isVerbose && isQuiet) {
	die(`不能同时使用 --debug 和 --quiet: ${process.argv}`);
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

export const mainCliController = {
	command: undefined as CommandDefine | undefined,
	setCommand(cmd: CommandDefine) {
		this.command = cmd;
	},
};

export function printCommonOptions() {
	process.stderr.write('\x1B[2m通用参数\x1B[0m:\n');

	const whitelist = mainCliController.command?.commonArgs ?? all_common_args;
	const clone_common: Record<string, ArgDefine> = {};
	for (const key of whitelist) {
		clone_common[key] = common_args[key];
	}

	process.stderr.write(formatOptions(clone_common, { color: 3, indent: '  ' }));
}

interface IFormatOptions {
	color?: number;
	indent?: string;
}
export function formatOptions(args: Record<string, ArgDefine>, { color, indent }: IFormatOptions = {}) {
	let r = '';
	if (!color) color = 14;
	if (!indent) indent = '';

	for (const [name, { description, flag }] of Object.entries(args)) {
		const names = name.split(',').map((n) => {
			n = n.trim();
			if (!n.startsWith('-')) {
				if (n.length > 1) {
					n = `--${n}`;
				} else {
					n = `-${n}`;
				}
			}
			return n;
		});

		const flag_suffix = flag ? '' : ' <value>';

		r += `${indent}\x1B[38;5;${color}m${names.join(', ')}${flag_suffix}\x1B[0m: ${description}\n`;
	}
	return r;
}
