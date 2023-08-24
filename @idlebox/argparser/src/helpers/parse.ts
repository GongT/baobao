import { ArgumentCommand, OptionKind } from '../main';
import { createCommandHelp } from './create-help-text';
import { ArgumentError } from './errors';

interface ICommandPrivate extends ICommand {
	readonly __refCmd: ArgumentCommand;
	readonly __prev?: ICommandPrivate;
}
export interface ICommand {
	name: string;
	next?: ICommand;
	argv: string[];
	extras?: string[];
	options: Record<string, any>;
}

export interface IParseInputResult {
	chain: ICommandPrivate;
}

export function parseInputArguments(root: ArgumentCommand, argv = process.argv.slice(2)): ICommand {
	const input = parseText(argv);
	const s = new State(input);

	if (s.isEol) {
		console.error(createCommandHelp(root));
		process.exit(1);
	}

	const head: ICommandPrivate = {
		name: root.name,
		__refCmd: root,
		options: {},
		argv: s.all(),
	};
	let tail = head;

	while (!s.isEol) {
		const curr = s.shift();
		if (curr.isOpt) {
			if (curr.text === 'help' || curr.text === 'h') {
				console.error(createCommandHelp(tail.__refCmd));
				process.exit(0);
			}
			const opt = requireOption(tail, curr.text);
			if (opt.type === OptionKind.Boolean) {
				tail.options[opt.fieldName] = s.shiftBoolean();
			} else {
				const v = s.shiftValue();
				if (opt.type === OptionKind.BigInt) {
					tail.options[opt.fieldName] = BigInt(v);
				} else if (opt.type === OptionKind.File || opt.type === OptionKind.String) {
					tail.options[opt.fieldName] = v;
				} else if (opt.type === OptionKind.Int) {
					tail.options[opt.fieldName] = parseInt(v);
				} else if (opt.type === OptionKind.Float) {
					tail.options[opt.fieldName] = parseFloat(v);
				}
				if (tail.options[opt.fieldName].toString() !== v) {
					throw new ArgumentError(`invalid value of option "${opt.fieldName}": ${v}`);
				}
			}
		} else if (tail.__refCmd.allowExtraOptions) {
			if (!tail.extras) tail.extras = [];
			tail.extras.push(curr.text);
		} else {
			const next = requireCommand(tail.__refCmd, curr.text);
			const element: ICommandPrivate = {
				name: next.name,
				__refCmd: next,
				__prev: tail,
				options: {},
				argv: s.all(),
			};
			tail.next = element;
			tail = element;
		}
	}

	return head;
}

class State {
	private cursor = 0;
	private lastOpt?: string;
	private readonly input;

	constructor(input: ArgElement[]) {
		this.input = input.slice();
	}

	peek() {
		return this.input[this.cursor];
	}
	shift() {
		if (this.isEol) {
			if (this.lastOpt) throw new Error(`option "${this.lastOpt}" expect a value`);
			else throw new Error('invalid state shift');
		}
		const r = this.input.shift()!;
		if (r.isOpt) {
			this.lastOpt = r.text;
		} else {
			delete this.lastOpt;
		}
		return r;
	}

	all() {
		return this.input.map((e) => e.text);
	}

	get isEol() {
		return this.input.length === 0;
	}

	public shiftValue() {
		const v = this.shift();
		if (v.isOpt) throw new ArgumentError(`option "${this.lastOpt}" want a value, but got "${v.text}"`);
		return v.text;
	}

	public shiftBoolean() {
		const p = this.peek();
		if (p.isOpt) {
			return true;
		}
		if (isTruthy(p.text)) {
			this.shift();
			return true;
		} else if (isFalsy(p.text)) {
			this.shift();
			return false;
		} else {
			return true;
		}
	}
}

interface ArgElement {
	text: string;
	isOpt: boolean;
}
function parseText(argv: readonly string[]) {
	const ret: ArgElement[] = [];
	for (let item of argv) {
		if (item.startsWith('--')) {
			item = item.replace(/^--/, '');
			const [a, b] = splitEqualSign(item);
			ret.push({ text: a, isOpt: true });
			if (b) {
				ret.push({ text: b, isOpt: false });
			}
		} else if (item.startsWith('-')) {
			item = item.replace(/^-/, '');
			const [a, b] = splitEqualSign(item);
			if (b) {
				// -a=1
				if (a.length > 1) {
					// -abc=v
					throw new ArgumentError('Cannot use equal sign in short option group: ' + item);
				}
				ret.push({ text: a, isOpt: true });
				ret.push({ text: b, isOpt: false });
			} else {
				// -abc
				for (const c of a) {
					ret.push({ text: c, isOpt: true });
				}
			}
		} else {
			ret.push({ text: item, isOpt: false });
		}
	}
	return ret;
}
function splitEqualSign(item: string): [string, string?] {
	const f = item.indexOf('=');
	if (f === -1) return [item];

	const a = item.slice(0, f);
	const b = item.slice(f + 1);
	return [a, b];
}

function isTruthy(text: string) {
	text = text.toLowerCase();
	return text === 'on' || text === 'yes' || text === 'true' || text === '1' || text === 'y';
}

function isFalsy(text: string) {
	text = text.toLowerCase();
	return text === 'off' || text === 'no' || text === 'false' || text === '0' || text === 'n';
}

function requireCommand(cmd: ArgumentCommand, text: string) {
	for (const next of cmd.commands) {
		if (next.name === text) return next;
	}
	throw new ArgumentError(`Unknown command: ${text}`);
}

function requireOption(cursor: ICommandPrivate, text: string) {
	for (let e = cursor; (e = e.__prev!); e) {
		for (const opt of e.__refCmd.options.values()) {
			if (opt.long === text || opt.short === text) {
				return opt;
			}
		}
	}

	throw new ArgumentError(`Unknown option: ${text}`);
}
