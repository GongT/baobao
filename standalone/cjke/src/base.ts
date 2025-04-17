import { emojiRegexConstructor } from './rollup.js';
import { ansiRegexConstructorLibrary } from './shim.lib.js';

function modifyRegexp(reg: RegExp): RegExp {
	const str = reg.toString().slice(1);
	const li = str.lastIndexOf('/');
	return new RegExp('^(?:' + str.slice(0, li) + ')', str.slice(li + 1));
}

/** @internal */
export const ansiRegex = ansiRegexConstructorLibrary();
/** @internal */
export const ansiRegexStarting = modifyRegexp(ansiRegex);

export const emojiRegex = emojiRegexConstructor();
export const emojiRegexStarting = modifyRegexp(emojiRegex);
export const emojiSimpleRegex =
	/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;

export interface SupportInfo {
	emojiSequence: boolean; // 👍🏽   - https://emojipedia.org/emoji-sequence
	combining: boolean; // À̀̀   -
	surrogates: boolean; //
}

/** @internal */
export const everything: Readonly<SupportInfo> = { emojiSequence: true, combining: true, surrogates: true };
/** @internal */
export const nothing: Readonly<SupportInfo> = { emojiSequence: false, combining: false, surrogates: false };
/** @internal */
export const vscodeIntegrated: Readonly<SupportInfo> = { emojiSequence: false, combining: true, surrogates: true };
/** @internal */
export const mintty: Readonly<SupportInfo> = { emojiSequence: false, combining: true, surrogates: true };

export const supports = {
	everything,
	nothing,
	vscodeIntegrated,
	mintty,
} as const;
