import * as isFullwidthCodePointType from 'is-fullwidth-code-point';
import * as ansiRegexConstructorType from 'ansi-regex';
import * as emojiRegexConstructorType from 'emoji-regex';

const isFullwidthCodePointAny = (isFullwidthCodePointType as any).default || isFullwidthCodePointType;
/** @internal */
export function isFullwidthCodePoint(code: number): boolean {
	return isFullwidthCodePointAny(code);
}

const ansiRegexConstructorAny = (ansiRegexConstructorType as any).default || ansiRegexConstructorType;
/** @internal */
export function ansiRegexConstructor(): RegExp {
	return ansiRegexConstructorAny();
}

const emojiRegexConstructorAny: any = emojiRegexConstructorType.default || emojiRegexConstructorType;
/** @internal */
export function emojiRegexConstructor(): RegExp {
	return emojiRegexConstructorAny();
}
