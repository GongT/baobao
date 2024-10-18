import type { InspectOptions } from 'node:util';
import type { IArgsReaderApi, NameKind, PositionKind } from '../interface.js';
import { bindArgType, ConflictArgument, StackTrace, UnexpectedArgument } from './errors.js';
import { customInspectSymbol, wrapStyle, writable } from './functions.js';
import { flag_match, tokenize, TokenKind, tokenToString, type IValue, type Token } from './tokens.js';

export enum ArgKind {
	unkown = 0, // must 0
	positional,
	flag,
	option,
	sub_command,
}

export interface IArgument<TokenType = Token> {
	readonly _id: string;
	readonly tokens: readonly TokenType[];
	readonly definition: readonly string[] | PositionKind;
	readonly parser: IArgsReaderApi;

	readonly firstUsageStack: StackTrace;
	readonly kind: ArgKind;
}

function argPrivateAssign<T>(
	args: Omit<IArgument<T>, 'parser' | 'firstUsageStack'>,
	parser: IArgsReaderApi,
): IArgument<T> {
	Object.assign(args, { firstUsageStack: new StackTrace(args._id), parser });

	(args as any)[customInspectSymbol] = function (
		this: IArgument,
		_depth: number,
		// inspectOptions: InspectOptions,
		// inspect: typeof node_inspect,
	) {
		return {
			tokens: this.tokens,
			definition: this.definition,
			kind: ArgKind[this.kind],
			parser: this.parser,
		};
	};

	return args as any;
}

/**
 * ArgReader的friend class
 * 实现绝大部分逻辑
 */
export class TokenMatch {
	private readonly memo = new Map<string, IArgument>();
	private positionalCache?: IValue[];

	constructor(
		private readonly tokens: readonly Token[],
		private readonly parser: IArgsReaderApi,
	) {}

	release(arg: IArgument) {
		for (const [key, value] of this.memo.entries()) {
			if (arg === value) {
				this.memo.delete(key);
				for (const token of arg.tokens) {
					delete token.bindingArgument;
				}
				return;
			}
		}
		throw new Error('release argument not found');
	}

	getOptionArgument(flags: NameKind): IArgument {
		return this.__get_arg_cache(flags, (arg) => {
			if (arg.kind !== ArgKind.unkown) {
				if (arg.kind !== ArgKind.option) {
					throw new ConflictArgument(`${ArgKind[arg.kind]} argument reused as option`, arg);
				}
				return;
			}

			const tokens = [];
			for (const item of arg.tokens) {
				if (item.kind === TokenKind.Both) {
					// ok
				} else if (item.kind === TokenKind.Flag && item.next?.kind === TokenKind.Value) {
					tokens.push(item.next);
				} else {
					throw new UnexpectedArgument(item, 'a value is required');
				}

				tokens.push(item);
			}
			writable(arg).tokens = tokens;

			bindArgType(arg, ArgKind.option);

			return;
		});
	}

	getFlagArgument(flags: NameKind): IArgument {
		return this.__get_arg_cache(flags, (arg) => {
			if (arg.kind !== ArgKind.unkown) {
				if (arg.kind !== ArgKind.flag) {
					throw new ConflictArgument(`${ArgKind[arg.kind]} argument reused as option`, arg);
				}
				return;
			}

			bindArgType(arg, ArgKind.flag);
		});
	}

	getPositionArgument(from: number, count: number): IArgument<IValue> {
		const id = isFinite(count) ? `range[${from}:${from + count}]` : `range[${from}:]`;
		const exists = this.memo.get(id);
		if (exists) {
			return exists as IArgument<IValue>;
		}
		const definition: PositionKind = [from, count];

		const tokens: IValue[] = [];

		const arg: IArgument<IValue> = argPrivateAssign(
			{
				_id: id,
				definition,
				tokens,

				kind: ArgKind.unkown,
			},
			this.parser,
		);

		for (const token of this.tokens) {
			if (token.kind !== TokenKind.Value) {
				// [--xxx]
				continue;
			}
			if (
				token.bindingArgument &&
				token.bindingArgument.kind !== ArgKind.positional &&
				token.bindingArgument.kind !== ArgKind.sub_command
			) {
				// --xxx [yyy]
				continue;
			}
			if (from-- > 0) {
				continue;
			}
			if (count-- <= 0) {
				break;
			}

			tokens.push(token);
		}

		bindArgType(arg, ArgKind.unkown);
		this.memo.set(id, arg);
		return arg;
	}

	private normalize(flags: NameKind) {
		if (typeof flags === 'string') {
			flags = [flags];
		}
		return { flags, id: flags.join('\0:') }; // 设置特殊字符防止冲突
	}

	/**
	 * 从 --x=y -x y --z 中
	 * 匹配 [--x, -x]
	 * 返回 [--x=y, -x]
	 */
	private __get_arg_cache(_flags: NameKind, fn: (arg: IArgument) => void) {
		const { id, flags } = this.normalize(_flags);
		const exists = this.memo.get(id);
		if (exists) {
			return exists;
		}
		delete this.positionalCache;

		const flagsToken = [];
		for (const flag of tokenize(flags)) {
			if (flag.kind !== TokenKind.Flag) {
				throw new Error('invalid flag name: ' + flag);
			}
			flagsToken.push(flag);
		}

		const tokens: Token[] = [];
		const info: IArgument = argPrivateAssign(
			{
				_id: id,
				definition: flags,
				tokens,

				kind: ArgKind.unkown,
			},
			this.parser,
		);

		for (const token of this.tokens) {
			if (token.kind === TokenKind.Value) continue;

			for (const flag of flagsToken) {
				if (flag_match(flag, token)) {
					tokens.push(token);
				}
			}
		}

		fn(info);

		this.memo.set(id, info);
		return info;
	}

	[customInspectSymbol](depth: number, { colors }: InspectOptions) {
		if (!this.memo.size) {
			return '{}';
		}
		const tab = ' '.repeat(depth);
		let ret = '{';
		for (const [key, value] of this.memo.entries()) {
			ret += `\n${tab}"${key}": ${wrapStyle(colors, '38;5;2', ArgKind[value.kind], '0')} {\n`;

			ret += value.tokens
				.map((x) => {
					return `${tab}  ${x.index} ` + wrapStyle(colors, '2', tokenToString(x), '0');
				})
				.join(' ');
			ret += `\n${tab}}`;
		}
		return ret;
	}
}
