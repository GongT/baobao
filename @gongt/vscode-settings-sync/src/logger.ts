import { OutputChannel, window } from 'vscode';
import { format } from 'util';

class Logger {
	private declare output: OutputChannel;

	constructor() {
		this.output = window.createOutputChannel('SettingsSync');
		this.output.show(false);
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

export const logger = new Logger();
