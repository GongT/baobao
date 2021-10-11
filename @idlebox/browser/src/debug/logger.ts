import { WrappedConsole, WrappedConsoleOptions } from '@idlebox/common';

interface WebConsoleOptions {
	color?: boolean | Partial<typeof colorMap>;
}

const colorMap = {
	info: 'color:blue',
	success: 'color:green',
	debug: 'color:gray',
	error: 'color:red',
	trace: 'color:gray',
	warn: 'color:yellow',
	assert: 'background:red;color:white',
};

export class WrappedWebConsole extends WrappedConsole {
	private readonly colors: Record<string, string> = colorMap;

	constructor(title: string, { color, ...opt }: WrappedConsoleOptions & WebConsoleOptions = {}) {
		super(title, opt);
		if (color === false) {
			this.colors = {};
		} else if (typeof color === 'object') {
			this.colors = { ...colorMap, ...color };
		}
	}

	protected processColorLabel(msg: any[], pos: number, level: string, prefix: string): void {
		if (this.colors[level]) {
			msg.splice(pos, 1, `%c${prefix}${msg[pos]}`, this.colors[level]);
		} else {
			msg[pos] = `${prefix}${msg[pos]}`;
		}
	}
}
