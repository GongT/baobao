import isFullwidthCodePoint from 'is-fullwidth-code-point';
import { ansiRegexStarting, emojiRegexStarting, emojiSimpleRegex } from './base.js';
import { combiningCharactersRegexStarting, isCombiningCharacters } from './combiningCharacters.js';
import type { SupportInfo } from './support-info.js';
import { everything } from './support-info.predefine.js';

export interface CodePointInfo {
	// 字符的原始文本
	data: string;
	// 字符的显示宽度，通常为1或2
	width: number;
	// 字符在字符串中的长度（可能大于1，例如emoji或代理对）
	length: number;
	// 字符是否在指定参数的终端中可见
	visible: boolean;
}

/**
 * 读取字符串中的第一个完整字符或转义序列，并返回其相关信息，包括显示宽度、长度和可见性。
 */
export function readFirstCompleteChar(str: string, supports: SupportInfo = everything): CodePointInfo {
	if (!str) {
		return { data: '', width: 0, length: 0, visible: false };
	}
	const code = str.codePointAt(0) ?? -1;
	let ret: CodePointInfo;

	if (code <= 0xff) {
		// ansi 控制序列
		const ansiMatch = str.match(ansiRegexStarting);
		if (ansiMatch) {
			return commonInvisible(ansiMatch[0]);
		}

		// ansi 控制字符
		if (code === 9) {
			// tab
			return {
				data: '\t',
				width: supports.tabSize,
				length: 1,
				visible: false,
			};
		} else if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
			return commonInvisible(str[0]);
		}

		// 普通 ansi 字符
		ret = commonSingleChar(str, code);
	} else if (isCombiningCharacters(code)) {
		// 处理多个组合字符
		const allChars = str.match(combiningCharactersRegexStarting);
		if (!allChars) throw new Error('unreachable');

		return {
			data: allChars[0],
			width: supports.combining ? 0 : allChars[0].length,
			length: allChars[0].length,
			visible: false,
		};
	} else {
		// emoji 表情
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
			// 代理对
			ret = {
				data: str.slice(0, 2),
				width: 2,
				length: 2,
				visible: true,
			};
			if (supports.surrogates) {
				ret.width = isFullwidthCodePoint(code) ? 2 : 1;
			}
		} else {
			// 普通 Unicode 字符
			ret = commonSingleChar(str, code);
		}
	}

	// 检查后续的组合字符
	const nextCode = str.codePointAt(ret.length) ?? -1;
	if (isCombiningCharacters(nextCode)) {
		const m = str.slice(ret.length).match(combiningCharactersRegexStarting);
		if (!m) throw new Error('unreachable');

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
		width: isFullwidthCodePoint(code) ? 2 : 1,
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
