import type { InspectOptions, inspect as node_inspect } from 'node:util';
import type { IArgsReaderApi, NameKind } from '../interface.js';
import { bindArgType, UnexpectedArgument } from './errors.js';
import { customInspectSymbol, wrapStyle } from './functions.js';
import { ArgKind, TokenMatch, type IArgument } from './tokens-match.js';
import { tokenize, TokenKind, tokenToString, type IValue, type Tokens } from './tokens.js';

export type IParams = readonly string[];

export class ArgsReader<T extends string = string> implements IArgsReaderApi {
	readonly tokens: Tokens;
	readonly match: TokenMatch;
	private readonly commands: IArgument<IValue>[] = [];
	private readonly level: number;

	constructor(
		readonly params: IParams,
		public readonly parent?: ArgsReader
	) {
		if (parent) {
			this.level = parent.level + 1;
			this.tokens = parent.tokens;
			this.match = parent.match;
			this.commands = parent.commands;
			// Object.defineProperty(this, 'value', { value: this.commands[this.level].tokens[0].value });
		} else {
			this.level = -1;
			this.tokens = tokenize(params);
			for (const token of this.tokens) {
				Object.assign(token, { parser: this });
			}
			this.match = new TokenMatch(this.tokens, this);
		}
	}

	get value(): T {
		if (this.level === -1) {
			throw new RangeError('can not use .value on root level');
		}
		return this.commands[this.level].tokens[0].value as any;
	}

	raw(index: number): string | undefined {
		return this.params[index];
	}

	at(index: number): string | undefined {
		return this.range(index, 1)[0];
	}

	range(index: number, maxCount = Number.POSITIVE_INFINITY): string[] {
		const arg = this.match.getPositionArgument(index + this.level + 1, maxCount);

		const ret = [];
		for (const token of arg.tokens) {
			ret.push(token.value);
		}

		bindArgType(arg, ArgKind.positional);

		this._check_continues(arg.tokens);

		return ret;
	}

	command<T extends string>(commands: readonly T[]): ArgsReader<T> | undefined {
		const arg = this.match.getPositionArgument(this.level + 1, 1);

		if (arg.tokens.length === 0) return;

		const cmd = arg.tokens[0]?.value as T;

		if (commands.includes(cmd)) {
			if (arg.kind === ArgKind.sub_command) return new ArgsReader(this.params, this);

			bindArgType(arg, ArgKind.sub_command);
			this.commands.push(arg);
			return new ArgsReader(this.params, this);
		}
		if (arg.kind === ArgKind.unkown) {
			this.match.release(arg);
		} else {
			bindArgType(arg, ArgKind.sub_command); // this must raise error
		}
		return;
	}

	single(name: NameKind): string | undefined {
		const multi = this.multiple(name);
		if (multi.length > 1) {
			throw new UnexpectedArgument(this.match.getOptionArgument(name).tokens[0], 'only allow one');
		}
		return multi[0];
	}

	multiple(name: NameKind) {
		const arg = this.match.getOptionArgument(name);

		const values = [];
		for (const token of arg.tokens) {
			if (token.kind === TokenKind.Flag) {
				values.push((token.next as IValue).value);
			} else {
				values.push(token.value);
			}
		}

		return values;
	}

	flag(name: NameKind) {
		const arg = this.match.getFlagArgument(name);

		for (const item of arg.tokens) {
			if (item.kind !== TokenKind.Flag) {
				throw new UnexpectedArgument(item, 'value not allowed here');
			}
		}

		return arg.tokens.length;
	}
	unused() {
		const r = [];
		for (const token of this.tokens) {
			if (token.bindingArgument) continue;
			r.push(tokenToString(token));
		}
		return r;
	}

	private _check_continues(tokens: Tokens) {
		let last: number | undefined;
		for (const token of tokens) {
			if (last !== undefined && last + 1 !== token.index) {
				throw new UnexpectedArgument(token, 'positional argument must continuous');
			}
			last = token.index;
		}
	}

	throwUnexpectedArgument(value: string, message?: string): never {
		const token = this.tokens.find((token) => {
			if (token.kind === TokenKind.Value) {
				return token.value === value;
			}
			return false;
		});
		if (!token) {
			throw new Error(`token not found for value: ${value}`);
		}
		throw new UnexpectedArgument(token, message ?? `unexpected argument: ${value}`);
	}

	private __inspecting = false;
	[customInspectSymbol](_depth: number, inspectOptions: InspectOptions, inspect: typeof node_inspect) {
		if (this.__inspecting) {
			return wrapStyle(inspectOptions.colors, '38;5;6', '[Circular]', '0');
		}
		const pobject = {
			tokens: this.tokens,
			arguments: this.match,
			level: this.level,
			value: this.level >= 0 ? this.value : undefined,
			commands: this.commands.map((v) => v.tokens[0].value),
		};
		const name = wrapStyle(inspectOptions.colors, '38;5;12', this.constructor.name, '0');
		return `[${name}] ${inspect(pobject, inspectOptions)}${wrapStyle(inspectOptions.colors, '2', ` <-- ${this.constructor.name}`, '0')}`;
	}
}
