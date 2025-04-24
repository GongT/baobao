import { nameFunction } from '../function/functionName.js';
import { isWeb } from '../platform/os.js';

export enum ColorKind {
	DISABLE = 0,
	TERMINAL = 1,
	WEB = 2,
	DETECT = 3,
}

export interface WrappedConsoleOptions {
	parent?: Console;
	bind?: boolean;
}

export abstract class WrappedConsole {
	public declare info: Console['info'];
	public declare log: Console['log'];
	public declare success: Console['log'];
	public declare debug: Console['debug'];
	public declare error: Console['error'];
	public declare trace: Console['trace'];
	public declare warn: Console['warn'];
	public declare assert: Console['assert'];

	public declare time: Console['time'];
	public declare timeEnd: Console['timeEnd'];
	public declare timeLog: Console['timeLog'];
	public declare count: Console['count'];
	public declare countReset: Console['countReset'];
	public declare group: Console['group'];
	public declare groupCollapsed: Console['groupCollapsed'];
	public declare groupEnd: Console['groupEnd'];

	public declare table: Console['table'];
	public declare dir: Console['dir'];
	public declare clear: Console['clear'];

	protected readonly title: string;
	protected readonly parent: Console;
	protected readonly bind: boolean;

	constructor(title: string, { parent, bind }: WrappedConsoleOptions = {}) {
		this.title = title;
		this.parent = parent || console;
		this.bind = bind || false;

		this.info = this.wrapMessageAt('info', 0);
		this.log = this.wrapMessageAt('log', 0);
		this.success = this.wrapMessageAt('log', 0);
		this.debug = this.wrapMessageAt('debug', 0);
		this.error = this.wrapMessageAt('error', 0);
		this.trace = this.wrapMessageAt('trace', 0);
		this.warn = this.wrapMessageAt('warn', 0);
		this.assert = this.wrapMessageAt('assert', 1);

		this.time = this.wrapMessageAt('time', 0);
		this.timeEnd = this.wrapMessageAt('timeEnd', 0);
		this.timeLog = this.wrapMessageAt('timeLog', 0);
		this.count = this.wrapMessageAt('count', 0);
		this.countReset = this.wrapMessageAt('countReset', 0);
		this.group = this.wrapMessageAt('group', 0);
		this.groupCollapsed = this.wrapMessageAt('groupCollapsed', 0);

		this.groupEnd = this.wrapSimple('groupEnd');
		this.table = this.wrapExtra('table', ' <<table>>');
		this.dir = this.wrapExtra('dir', ' <<dir>>');
		this.clear = this.wrapExtra('clear', ' <<clear>>');
	}

	protected wrap<T extends keyof Omit<Console & { Console: any }, 'Console'>>(original: T): Function {
		if (this.bind) {
			return this.parent[original].bind(this.parent) as any;
		}
		return this.parent[original];
	}

	private wrapSimple<T extends keyof Omit<Console & { Console: any }, 'Console'>>(original: T): Console[T] {
		return nameFunction(`console:${original}`, this.wrap(original) as any);
	}

	private wrapExtra<T extends keyof Omit<Console & { Console: any }, 'Console'>>(
		original: T,
		exMessage: string
	): Console[T] {
		const bindedFn = this.wrap(original);
		return nameFunction(`console:${original}`, (...args: any[]) => {
			this.log(exMessage);
			bindedFn(...args);
		});
	}

	protected createPrefix(message: string) {
		let prefix = `[${this.title}]`;
		if (message) {
			prefix += `[${message}] `;
		} else {
			prefix += ' ';
		}
		return prefix;
	}

	private wrapMessageAt<T extends keyof Omit<Console & { Console: any }, 'Console'>>(
		original: T,
		messageLoc: number,
		additionalPrefix?: string
	): Console[T] {
		let prefix = `[${this.title}]`;
		if (additionalPrefix) {
			prefix += `[${additionalPrefix}] `;
		} else {
			prefix += ' ';
		}

		const fn = this.wrap(original);

		return nameFunction(`console:${original}`, (...args: any[]) => {
			this.convertObjectArg(args, messageLoc);
			this.processColorLabel(args, messageLoc, original, prefix);
			fn(...args);
		});
	}

	private convertObjectArg(args: any[], pos: number) {
		const msg = args[pos];
		if (args.length > pos) {
			if (typeof msg === 'string') {
				return;
			}

			args.splice(pos, 0, (isWeb ? ' %o' : ' %j').repeat(args.length - pos).substr(1));
		} else {
			args[pos] = '';
		}
	}

	protected abstract processColorLabel(
		normalizedArguments: any[],
		messageLoc: number,
		level: string,
		prefix: string
	): void;

	protected uncolor(args: any[], pos: number, prefix: string, postfix: string) {
		args[pos] = prefix + args[pos] + postfix;
	}
}
