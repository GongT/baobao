import { format } from 'util';
import { context } from './context';

export interface ILogger {
	log(msg: any, ...args: any[]): void;
	info(msg: any, ...args: any[]): void;
	warn(msg: any, ...args: any[]): void;
	error(msg: any, ...args: any[]): void;
	debug(msg: any, ...args: any[]): void;
	emptyline(): void;
}
export abstract class BaseLogger implements ILogger {
	protected constructor(register: boolean = true) {
		if (register) {
			try {
				context.subscriptions.push(this);
			} catch (e) {
				console.error('can not append dispose queue. (%s)', this.constructor.name);
			}
		}
	}

	protected abstract appendLine(line: string): void;
	abstract dispose(): void | Promise<void>;

	protected format(tag: string, args: any[]) {
		tag = `[${tag}] `;
		if (!args.length) {
			return tag;
		}
		let msg: string;
		if (typeof args[0] === 'string') {
			msg = tag + args.shift();
		} else {
			msg = tag;
		}
		return format(msg, ...args);
	}

	public log(...args: any[]) {
		this.appendLine(this.format('INFO ', args));
	}
	public info(...args: any[]) {
		this.appendLine(this.format('INFO ', args));
	}
	public warn(...args: any[]) {
		this.appendLine(this.format('WARN ', args));
	}
	public error(...args: any[]) {
		this.appendLine(this.format('ERROR', args));
	}
	public debug(...args: any[]) {
		this.appendLine(this.format('DEBUG', args));
	}

	public emptyline() {
		this.appendLine('');
	}
}
