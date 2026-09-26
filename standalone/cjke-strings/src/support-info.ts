export interface SupportInfo {
	readonly emojiSequence: boolean; // 👍🏽   - https://emojipedia.org/emoji-sequence
	readonly combining: boolean; // À̀̀   -
	readonly surrogates: boolean; //
	readonly tabSize: number;
}

export * as supports from './support-info.predefine.js';
