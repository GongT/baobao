import type { InspectOptions, InspectOptionsStylized, inspect as node_inspect } from 'node:util';
import { customInspectSymbol, wrapStyle } from '../tools/color.js';
import {
	normalizeParameterDescription,
	normalizeParameterDescriptionFlag,
	normalizeParameterDescriptionRange,
} from '../tools/param-desc.js';
import { tokenize } from '../tools/tokenize.js';
import {
	ParamKind,
	TokenKind,
	type IArgsReaderApi,
	type IArgumentList,
	type ISubArgsReaderApi,
	type ParamDefineFlag,
} from '../types.js';
import { Unexpected, UnexpectedCommand } from './errors.js';
import { isDoubleDash, isValue, matchFlagByFlags, matchOptionByFlags } from './match.js';
import { ParameterHolder } from './parameter.holder.js';
import { CommandArguments } from './reader.cmd.js';
import type { TToken, ValueToken } from './token.js';

class ArgumentsInspectHolder extends Array<TToken> {
	[customInspectSymbol](depth: number, inspectOptions: InspectOptions, inspect: typeof node_inspect) {
		if (depth <= 0) {
			return wrapStyle(inspectOptions.colors, '38;5;6', '[Circular]', '0');
		}
		let ret = '[';
		for (const token of this) {
			const param = token.getBinding();
			let ex = '';
			if (param) {
				ex = wrapStyle(inspectOptions.colors, '2', ` // ${param._id}`, '0');
			}
			ret += `\n  ${inspect(token, inspectOptions)},${ex}`;
		}
		ret += `\n]`;
		return ret;
	}
}

export class ApplicationArguments implements IArgsReaderApi {
	public readonly parameters = new ParameterHolder();
	public readonly arguments: ArgumentsInspectHolder;

	public readonly raw: IArgumentList;
	private readonly doubleDash: number;

	constructor(argv: IArgumentList) {
		this.raw = argv.slice();
		this.arguments = new ArgumentsInspectHolder(...tokenize(argv, this));

		this.doubleDash = this.arguments.findIndex((token) => isDoubleDash(token));
	}

	single(name: ParamDefineFlag): string | undefined {
		const result = this.match_values(name);
		if (result.length > 1) {
			throw new Unexpected(result[1], `expected single value.`);
		}
		return result[0]?.value;
	}
	multiple(name: ParamDefineFlag): string[] {
		const result = this.match_values(name);

		return result.map((e) => e.value);
	}

	private match_values(name: ParamDefineFlag): TToken<TokenKind.Value | TokenKind.Both>[] {
		const desc = normalizeParameterDescriptionFlag(name);
		const parameter = this.parameters.singleton(desc);

		const matched = matchOptionByFlags(this.arguments, desc);
		if (!matched.length) {
			return [];
		}

		const matched_with_value = new Set<TToken>();
		const result = [];
		for (const m of matched) {
			matched_with_value.add(m.flag);
			matched_with_value.add(m.value);

			result.push(m.value);
		}
		parameter.bindArgType(ParamKind.flag, [...matched_with_value.values()]);

		return result;
	}

	flag(name: ParamDefineFlag): number {
		const desc = normalizeParameterDescriptionFlag(name);
		const parameter = this.parameters.singleton(desc);
		const matched = matchFlagByFlags(this.arguments, desc);
		if (!matched.length) {
			return 0;
		}

		const valid_flags = [];
		for (const m of matched) {
			valid_flags.push(m);
		}
		parameter.bindArgType(ParamKind.flag, valid_flags);

		let value = matched.length;

		const negated = [];
		for (const item of desc.flags) {
			if (item.startsWith('--no-')) {
				negated.length = 0;
				break;
			}

			if (item.startsWith('--')) {
				negated.push(`--no-${item.slice(2)}`);
			}
		}
		if (negated.length) {
			if (negated.length === 1 && desc.single) {
				value -= this.flag(negated[0]);
			} else {
				value -= this.flag(negated);
			}
		}

		return value;
	}

	public _arg_positional(from = 0, to = Number.POSITIVE_INFINITY): ValueToken[] {
		const args_tokens: ValueToken[] = [];
		let count = to - from;
		for (const arg of this.arguments) {
			if (!isValue(arg)) {
				// 带flag的不可能是位置参数
				continue;
			}

			const used = arg.getBinding();
			if (!used) {
				// 没绑定的可以是一个位置参数
			} else if (used.kind === ParamKind.positional || used.kind === ParamKind.sub_command) {
				// 绑定成位置参数的当然是位置参数
			} else {
				continue;
			}

			if (from-- > 0) {
				continue;
			}
			if (count-- === 0) {
				break;
			}

			args_tokens.push(arg);
		}
		return args_tokens;
	}

	private _positional(from = 0, to = Number.POSITIVE_INFINITY): ValueToken[] {
		if (this.doubleDash >= 0) {
			const base = this.doubleDash + 1;
			return this.arguments.slice(base + from, base + to) as ValueToken[];
		} else {
			return this._arg_positional(from, to);
		}
	}

	at(index: number): string | undefined {
		return this.range(index, 1)[0];
	}
	range(index: number, maxCount = Number.POSITIVE_INFINITY): string[] {
		const desc = normalizeParameterDescriptionRange([index, maxCount]);
		const parameter = this.parameters.singleton(desc);

		const args = this._positional(desc.from, desc.to);

		parameter.bindArgType(ParamKind.positional, args);

		return args.map((arg) => {
			return arg.value;
		});
	}

	unused(): string[] {
		const unused: string[] = [];
		for (const arg of this.arguments) {
			if (isDoubleDash(arg)) continue;

			const used = arg.getBinding();
			if (!used) {
				unused.push(arg.toString());
			}
		}
		return unused;
	}

	command<T extends string>(commands: readonly T[]): ISubArgsReaderApi<T> | undefined {
		const desc = normalizeParameterDescription({ commands, level: 1 });
		const parameter = this.parameters.singleton(desc);

		const args = this._arg_positional();

		let first_available: ValueToken | undefined;
		for (const arg of args) {
			const used = arg.getBinding();
			if (!used || used.kind === ParamKind.sub_command) {
				first_available = arg;
				break;
			}
		}
		if (!first_available) {
			return undefined;
		}

		if (!commands.includes(first_available.value as any)) {
			throw new UnexpectedCommand(first_available, commands);
		}

		const base = args.indexOf(first_available);
		parameter.bindArgType(ParamKind.sub_command, [first_available]);
		return new CommandArguments(this, base + 1, parameter);
	}

	// throwUnexpectedArgument(value: string, message?: string): never {
	// 	const token = this.arguments.find((token) => {
	// 		const tk = token.valueOf();
	// 		if (tk.kind === TokenKind.Value) {
	// 			return tk.value === value;
	// 		}
	// 		return false;
	// 	});
	// 	if (!token) {
	// 		throw new Error(`token not found for value: ${value}`);
	// 	}
	// 	throw new UnexpectedArgument(token, message ?? `unexpected argument: ${value}`);
	// }

	private __inspecting = false;
	[customInspectSymbol](depth: number, options: InspectOptionsStylized, inspect: typeof node_inspect) {
		const name = options.stylize(`[${this.constructor.name}]`, 'special');
		if (this.__inspecting || depth < 0) return name;
		this.__inspecting = true;

		const newOptions = Object.assign({}, options, {
			depth: options.depth ? options.depth - 1 : null,
		});

		console.log(depth, options);

		const pobject = {
			arguments: this.arguments,
			parameters: this.parameters,
		};
		const text = `${name} ${inspect(pobject, newOptions)}${wrapStyle(options.colors, '2', ` <-- ${this.constructor.name}`, '0')}`;
		this.__inspecting = false;
		return text;
	}
}
