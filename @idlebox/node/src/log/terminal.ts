import { WrappedConsole, type WrappedConsoleOptions } from '@idlebox/common';

interface TerminalConsoleOptions {
	color?: boolean | Partial<typeof colorMap>;
}

const colorMap = {
	info: '38;5;14',
	success: '38;5;10',
	debug: '2',
	error: '38;5;9',
	trace: '2',
	warn: '38;5;11',
	assert: '38;5;9;7',
};

export class WrappedTerminalConsole extends WrappedConsole {
	private readonly colors: Record<string, string> = colorMap;

	constructor(title: string, { color, ...opt }: WrappedConsoleOptions & TerminalConsoleOptions = {}) {
		super(title, opt);
		if (color === false) {
			this.colors = {};
		} else if (color === undefined) {
			if (!process.stderr.isTTY || !process.stdout.isTTY) {
				this.colors = {};
			}
		} else if (typeof color === 'object') {
			this.colors = { ...colorMap, ...color };
		}
	}

	protected processColorLabel(msg: any[], pos: number, level: string, prefix: string): void {
		if (this.colors[level]) {
			msg[pos] = `\x1B[${this.colors[level]}m${prefix}${msg[pos]}`;
			msg.push('\x1B[0m');
		} else {
			msg[pos] = `${prefix}${msg[pos]}`;
		}
	}
}
