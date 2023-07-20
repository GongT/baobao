import emojiRegexConstructorType from 'emoji-regex';

const emojiRegexConstructorAny: any = (emojiRegexConstructorType as any).default || emojiRegexConstructorType;
/** @internal */
export function emojiRegexConstructor(): RegExp {
	return emojiRegexConstructorAny();
}
