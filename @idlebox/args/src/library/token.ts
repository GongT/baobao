import type { InspectOptions } from 'node:util';
import { die } from '../tools/assert.js';
import { customInspectSymbol, wrapStyle } from '../tools/color.js';
import { type IValue, TokenKind, type IFlag, type IFlagValue, type IToken } from '../types.js';
import type { Parameter } from './parameter.js';
import type { ApplicationArguments } from './reader.app.js';

export interface IShared {
	readonly kind: TokenKind;
	/**
	 * 在argument中的位置，可以大于total
	 */
	readonly index: number;
	/**
	 * argument中 -- 前面的参数总数
	 */
	readonly total: number;
}

type MShared = Omit<IShared, 'kind'>;
type NS<T> = Omit<T, keyof IShared>;

type TAnyToken = FlagToken | ValueToken | BothToken | DoubleDashToken;
export type TToken<Kind extends TokenKind | unknown = unknown> = Kind extends TokenKind.Flag ? FlagToken : Kind extends TokenKind.Value ? ValueToken : Kind extends TokenKind.Both ? BothToken : Kind extends TokenKind.DoubleDash ? DoubleDashToken : TAnyToken;

abstract class BaseToken<T extends TokenKind = TokenKind> implements IShared {
	public abstract readonly kind: T;
	public readonly index: number;
	public readonly total: number;
	readonly #parser: undefined | ApplicationArguments;

	constructor(parser: undefined | ApplicationArguments, shared: MShared) {
		this.#parser = parser;
		this.index = shared.index;
		this.total = shared.total;
	}

	getParser(): ApplicationArguments {
		if (!this.#parser) {
			throw new TypeError('parser is not set, only available for createArgsReader');
		}
		return this.#parser;
	}

	// private _next?: TokenData<TokenKind.Value>;
	// set next(token: TokenData<TokenKind.Value>) {
	// 	if (this._next) die('next can only be set once');
	// 	this._next = token;
	// }
	// get next(): undefined | TokenData<TokenKind.Value> {
	// 	return this._next;
	// }

	#binding?: Parameter;
	getBinding() {
		return this.#binding;
	}
	bindTo(value: Parameter) {
		if (this.#binding) {
			if (this.#binding === value) return;
			die(`binding can only be set once for ${this.toString()}`);
		}
		this.#binding = value;
	}

	abstract valueOf(): TToken<T>;

	toString() {
		let r = '';
		const token: IToken = this.valueOf();
		if (token.kind === TokenKind.Flag || token.kind === TokenKind.Both) {
			r += token.short ? `-${token.name}` : `--${token.name}`;
			if (token.kind === TokenKind.Both) {
				r += `=${token.value}`;
			}
		} else if (token.kind === TokenKind.Value) {
			r += token.value;
		}
		return r;
	}

	[customInspectSymbol](_depth: number, { colors }: InspectOptions /* inspect: typeof node_inspect*/) {
		let r = '';

		const token: IToken = this.valueOf();
		if (token.kind === TokenKind.Flag || token.kind === TokenKind.Both) {
			r += token.short ? '-' : '--';

			r += wrapStyle(colors, '4', token.name, '24');

			if (token.kind === TokenKind.Both) {
				r += `=${JSON.stringify(token.value)}`;
			}

			const T = TokenKind[token.kind];
			return wrapStyle(colors, this.#binding ? '38;5;10' : '2', `<${T}Token ${r}>`, '0');
		}
		if (token.kind === TokenKind.Value) {
			const v = JSON.stringify(token.value);
			return wrapStyle(colors, this.#binding ? '38;5;10' : '2', `<ValueToken ${v}>`, '0');
		}
		if (token.kind === TokenKind.DoubleDash) {
			return wrapStyle(colors, '38;5;14;2', `<!-- double dash -->`, '0');
		}
		return wrapStyle(colors, '38;5;9', 'unknown', '0');
	}
}

export class ValueToken extends BaseToken<TokenKind.Value> {
	override readonly kind = TokenKind.Value;
	public readonly value: string;

	constructor(parser: undefined | ApplicationArguments, shared: MShared, content: NS<IValue>) {
		super(parser, shared);

		this.value = content.value;
	}

	override valueOf(): ValueToken {
		return this;
	}
}

export class FlagToken extends BaseToken {
	override readonly kind = TokenKind.Flag;
	public readonly name: string;
	public readonly short: boolean;

	constructor(parser: undefined | ApplicationArguments, shared: MShared, content: NS<IFlag>) {
		super(parser, shared);
		this.name = content.name;
		this.short = content.short;
	}

	flag() {
		return `${this.short ? '-' : '--'}${this.name}`;
	}

	override valueOf(): FlagToken {
		return this;
	}
}

export class BothToken extends BaseToken {
	override readonly kind = TokenKind.Both;
	public readonly name: string;
	public readonly short: boolean;
	public readonly value: string;

	constructor(parser: undefined | ApplicationArguments, shared: MShared, content: NS<IFlagValue>) {
		super(parser, shared);
		this.name = content.name;
		this.short = content.short;
		this.value = content.value;
	}

	flag() {
		return `${this.short ? '-' : '--'}${this.name}`;
	}

	override valueOf(): BothToken {
		return this;
	}
}

export class DoubleDashToken extends BaseToken {
	override readonly kind = TokenKind.DoubleDash;

	override valueOf(): DoubleDashToken {
		return this;
	}

	override bindTo() {
		die(`about to binding double dash`);
	}
}
