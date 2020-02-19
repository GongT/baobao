import { OutputChannel, window } from 'vscode';
import { format } from 'util';

/** @internal */
export const ignoreSymbol = Symbol('ignore');

export class VSCodeChannelLogger {
	private declare output: OutputChannel;

	constructor(title: string);
	/** @internal */
	constructor(title: symbol);

	constructor(title: symbol | string) {
		if (title !== ignoreSymbol) {
			this.setTitle(title as string);
		}
	}

	/** @internal */
	setTitle(title: string) {
		if (this.output) {
			throw new Error('call logger::setTitle multiple times');
		}
		this.output = window.createOutputChannel(title);
		this.output.show(false);
	}

	/** @internal */
	destroy() {
		this.output.dispose();
	}

	private format(tag: string, args: any[]) {
		tag = `[${tag}] `;
		if (!args.length) {
			return this.output.appendLine(tag);
		}
		let msg: string;
		if (typeof args[0] === 'string') {
			msg = tag + args.shift();
		} else {
			msg = tag;
		}
		this.output.appendLine(format(msg, ...args));
	}
	public log(...args: any[]) {
		this.format('INFO ', args);
	}
	public warn(...args: any[]) {
		this.format('WARN ', args);
	}
	public error(...args: any[]) {
		this.format('ERROR', args);
	}
	public debug(...args: any[]) {
		this.format('DEBUG', args);
	}
}
