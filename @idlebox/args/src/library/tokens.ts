import type { InspectOptions } from 'node:util';
import type { IArgsReaderApi } from '../interface.js';
import type { IParams } from './args-reader.js';
import { customInspectSymbol, wrapStyle, writable } from './functions.js';
import type { IArgument } from './tokens-match.js';

export type Token = IFlag | IValue | IFlagValue;
export type Tokens = readonly Token[];

export enum TokenKind {
	Flag = 0,
	Value = 1,
	Both = 2,
}

interface IAttachData {
	readonly kind: TokenKind;
	readonly index: number;
	readonly parser?: IArgsReaderApi;
	bindingArgument?: IArgument;
}

export interface IFlag extends IAttachData {
	readonly kind: TokenKind.Flag;
	readonly name: string;
	readonly short: boolean;
	readonly next?: IValue;
}
export interface IValue extends IAttachData {
	readonly kind: TokenKind.Value;
	readonly value: string;
}
export interface IFlagValue extends Omit<IFlag, 'kind'>, Omit<IValue, 'kind'>, IAttachData {
	readonly kind: TokenKind.Both;
}

const isFlag = /^-{1,2}(?!-)/;

export function tokenToString(token: Token) {
	let r = '';
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
export function flag_match(flag: IFlag, token: Token): boolean {
	return (
		(token.kind === TokenKind.Flag || token.kind === TokenKind.Both) &&
		token.short === flag.short &&
		token.name === flag.name
	);
}

export function tokenize(params: IParams): Tokens {
	const tokens: Token[] = [];
	let valueMode;
	for (const [index, param] of params.entries()) {
		if (valueMode) {
			tokens.push({ index, kind: TokenKind.Value, value: param });
		} else if (param === '--') {
			valueMode = true;
		} else if (!valueMode && isFlag.test(param)) {
			let [name, value] = param.replace(isFlag, '').split('=', 2);
			const short = param[1] !== '-';

			if (short && name.length > 1) {
				for (const ch of name.slice(0, -1)) {
					tokens.push({ index, kind: TokenKind.Flag, name: ch, short: true });
				}
				name = name.slice(-1);
			}

			if (value) {
				tokens.push({ index, kind: TokenKind.Both, name, short, value });
			} else {
				tokens.push({ index, kind: TokenKind.Flag, name, short });
			}
		} else {
			tokens.push({ index, kind: TokenKind.Value, value: param });
		}
	}

	for (const token of tokens) {
		if (token.kind === TokenKind.Flag) {
			const next = tokens[token.index + 1];
			if (!next || next.kind !== TokenKind.Value) continue;

			writable(token).next = next;
		}

		attachDebug(token);
	}

	return tokens;
}

function attachDebug(token: Token) {
	(token as any)[customInspectSymbol] = (
		_depth: number,
		{ colors }: InspectOptions
		// inspect: typeof node_inspect,
	) => {
		let r = '';

		if (token.kind === TokenKind.Flag || token.kind === TokenKind.Both) {
			r += token.short ? '-' : '--';

			r += wrapStyle(colors, '4', token.name, '24');

			if (token.kind === TokenKind.Both) {
				r += `=${JSON.stringify(token.value)}`;
			}

			const T = TokenKind[token.kind];
			return wrapStyle(colors, token.bindingArgument ? '38;5;10' : '2', `<${T}Token ${r}>`, '0');
		}
		if (token.kind === TokenKind.Value) {
			const v = JSON.stringify(token.value);
			return wrapStyle(colors, token.bindingArgument ? '38;5;10' : '2', `<ValueToken ${v}>`, '0');
		}
		return wrapStyle(colors, '38;5;9', 'unkown', '0');
	};
}
