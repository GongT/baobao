import type { IParamDescFlag } from '../tools/param-desc.js';
import { TokenKind } from '../types.js';
import { Unexpected } from './errors.js';
import type { BothToken, DoubleDashToken, FlagToken, TToken, ValueToken } from './token.js';

type MatchedFlagWithValue = { flag: BothToken | FlagToken; value: TToken<TokenKind.Value | TokenKind.Both> };
type MatchedFlagWithoutValue = FlagToken;

export function isDoubleDash(token: TToken): token is DoubleDashToken {
	return token && token.kind === TokenKind.DoubleDash;
}
export function isValue(token: TToken): token is ValueToken {
	return token && token.kind === TokenKind.Value;
}
export function hasValue(token: TToken): token is ValueToken | BothToken {
	return token && (token.kind === TokenKind.Value || token.kind === TokenKind.Both);
}

export function isFlag(token: TToken): token is FlagToken | BothToken {
	return token && token.kind === TokenKind.Flag;
}
export function hasFlag(token: TToken): token is FlagToken | BothToken {
	return token && (token.kind === TokenKind.Flag || token.kind === TokenKind.Both);
}

export function matchOptionByFlags(tokens: readonly TToken[], flag: IParamDescFlag): MatchedFlagWithValue[] {
	const matchedFlags: MatchedFlagWithValue[] = [];
	for (const token of tokens) {
		if (isDoubleDash(token)) break;

		if (!hasFlag(token)) continue;
		if (!isMatchFlag(token, flag)) continue;

		if (hasValue(token)) {
			matchedFlags.push({ flag: token, value: token });
		} else {
			const next = tokens[tokens.indexOf(token) + 1];
			if (!next) {
				throw new Unexpected(token, `unexpected ending, should have value`);
			}
			if (!isValue(next)) {
				throw new Unexpected(next, `unexpected flag, should have value`);
			}

			matchedFlags.push({ flag: token, value: next });
		}
	}
	return matchedFlags;
}

export function matchFlagByFlags(tokens: readonly TToken[], flag: IParamDescFlag): MatchedFlagWithoutValue[] {
	const matchedFlags: MatchedFlagWithoutValue[] = [];
	for (const token of tokens) {
		if (isDoubleDash(token)) break;

		if (!hasFlag(token)) continue;
		if (!isMatchFlag(token, flag)) continue;

		if (hasValue(token)) {
			throw new Unexpected(token, `unexpected option, flag can not have value`);
		} else {
			matchedFlags.push(token);
		}
	}
	return matchedFlags;
}

export function isMatchFlag(token: TToken, flag: IParamDescFlag) {
	if (!hasFlag(token)) return false;

	for (const f of flag.flags) {
		if (token.flag() === f) {
			return true;
		}
	}
	return false;
}
