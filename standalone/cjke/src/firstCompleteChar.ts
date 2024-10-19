import { everything, ansiRegexStarting, emojiRegexStarting, emojiSimpleRegex, SupportInfo } from './base';
import { combiningCharactersRegexStarting, isCombiningCharacters } from './combiningCharacters';
import { isFullwidthCodePointLibrary } from './shim.lib';

export interface CodePointInfo {
	data: string;
	width: number;
	length: number;
	visible: boolean; // some char visible on win console
}

export function readFirstCompleteChar(str: string, supports: SupportInfo = everything): CodePointInfo {
	if (!str) {
		return { data: '', width: 0, length: 0, visible: false };
	}
	const code = str.codePointAt(0)!;
	let ret: CodePointInfo;

	if (code <= 0xff) {
		// ansi control sequence
		const ansiMatch = str.match(ansiRegexStarting);
		if (ansiMatch) {
			return commonInvisible(ansiMatch[0]);
		}

		// ansi control characters
		if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
			return commonInvisible(str[0]);
		}

		// common ansi char
		ret = commonSingleChar(str, code);
	} else if (isCombiningCharacters(code)) {
		// handle multiple combine char
		const allChars = str.match(combiningCharactersRegexStarting)!;

		return {
			data: allChars[0],
			width: supports.combining ? 0 : allChars[0].length,
			length: allChars[0].length,
			visible: false,
		};
	} else {
		// emoji
		const emojiMatch = str.match(emojiRegexStarting);
		if (emojiMatch) {
			ret = {
				data: emojiMatch[0],
				width: 2,
				length: emojiMatch[0].length,
				visible: true,
			};
			if (!supports.emojiSequence) {
				let i = 0;
				while (emojiSimpleRegex.exec(emojiMatch[0])) {
					i++;
				}
				ret.width = i * 2;
			}
		} else if (code > 0xffff) {
			// Surrogates
			ret = {
				data: str.slice(0, 2),
				width: 2,
				length: 2,
				visible: true,
			};
			if (supports.surrogates) {
				ret.width = isFullwidthCodePointLibrary(code) ? 2 : 1;
			}
		} else {
			// common unicode char
			ret = commonSingleChar(str, code);
		}
	}

	// look ahead for combining chars
	const nextCode = str.codePointAt(ret.length)!;
	if (isCombiningCharacters(nextCode)) {
		const m = str.slice(ret.length).match(combiningCharactersRegexStarting)!;
		ret.data += m[0];
		ret.length += m[0].length;
		if (!supports.combining) {
			ret.width += m[0].length;
		}
	}

	return ret;
}

function commonSingleChar(str: string, code: number) {
	return {
		data: str[0],
		width: isFullwidthCodePointLibrary(code) ? 2 : 1,
		length: 1,
		visible: true,
	};
}

function commonInvisible(str: string) {
	return {
		data: str,
		width: 0,
		length: str.length,
		visible: false,
	};
}
