export const combiningCharactersRegex = /[\u{0300}-\u{036F}]|[\u{1AB0}-\u{1AFF}]|[\u{1DC0}-\u{1DFF}]|[\u{20D0}-\u{20FF}]|[\u{FE20}-\u{FE2F}]/gu;

/** @internal */
export const combiningCharactersRegexStarting = /^([\u{0300}-\u{036F}]|[\u{1AB0}-\u{1AFF}]|[\u{1DC0}-\u{1DFF}]|[\u{20D0}-\u{20FF}]|[\u{FE20}-\u{FE2F}])+/gu;

/**
 * 检查给定的 Unicode 码点是否属于组合字符。
 *
 * @see https://en.wikipedia.org/wiki/Combining_character
 */
export function isCombiningCharacters(code: number) {
	return (
		(code >= 0x300 && code <= 0x36f) ||
		(code >= 0x1ab0 && code <= 0x1aff) ||
		(code >= 0x1dc0 && code <= 0x1dff) ||
		(code >= 0x20d0 && code <= 0x20ff) ||
		(code >= 0xfe20 && code <= 0xfe2f)
	);
}
