import { format, inspect } from 'util';
import { context } from './context';

export interface ILogger {
	dir(obj: any, options?: any): void;
	log(msg: any, ...args: any[]): void;
	info(msg: any, ...args: any[]): void;
	warn(msg: any, ...args: any[]): void;
	error(msg: any, ...args: any[]): void;
	debug(msg: any, ...args: any[]): void;
	trace(msg: any, ...args: any[]): void;
	emptyline(): void;
}
export abstract class BaseLogger implements ILogger {
	private prefix: string = '';
	private prefixSkipTag: string = '       ';
	protected constructor(register: boolean = true) {
		if (register) {
			try {
				context.subscriptions.push(this);
			} catch (e) {
				console.error('can not append dispose queue. (%s)', this.constructor.name);
			}
		}
	}

	indent() {
		this.prefix += '  ';
		this.prefixSkipTag = this.prefix + '       ';
	}

	dedent() {
		this.prefix = this.prefix.slice(2);
		this.prefixSkipTag = this.prefix + '       ';
	}

	protected abstract appendLine(line: string): void;
	abstract dispose(): void | Promise<void>;

	protected format(tag: string, args: any[]) {
		tag = `[${tag}] ${this.prefix}`;
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

	dir(obj: any, options?: any): void {
		this.appendLine('');
		this.appendLine(inspect(obj, options));
		this.appendLine('');
	}
	public log(...args: any[]) {
		this.appendLine(this.format(' LOG ', args));
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
	public trace(...args: any[]) {
		const stack = new Error()
			.stack!.split('\n')
			.slice(2)
			.map((item) => this.prefixSkipTag + item)
			.join('\n');
		this.appendLine(this.format('TRACE', [...args, '\n' + stack]));
	}

	public emptyline() {
		this.appendLine('');
	}
}
