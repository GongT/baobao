import { emojiRegexConstructor } from './rollup.js';
import ansiRegexConstructor from 'ansi-regex';

function modifyRegexp(reg: RegExp): RegExp {
	const str = reg.toString().slice(1);
	const li = str.lastIndexOf('/');
	return new RegExp(`^(?:${str.slice(0, li)})`, str.slice(li + 1));
}

/** @internal */
export const ansiRegex = ansiRegexConstructor();
/** @internal */
export const ansiRegexStarting = modifyRegexp(ansiRegex);

export const emojiRegex = emojiRegexConstructor();
export const emojiRegexStarting = modifyRegexp(emojiRegex);
export const emojiSimpleRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
