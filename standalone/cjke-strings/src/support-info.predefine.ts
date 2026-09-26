import type { SupportInfo } from './support-info.js';

/** @internal */
export const everything: Readonly<SupportInfo> = { emojiSequence: true, combining: true, surrogates: true, tabSize: 8 };
/** @internal */
export const nothing: Readonly<SupportInfo> = { emojiSequence: false, combining: false, surrogates: false, tabSize: 8 };
/** @internal */
export const vscodeIntegrated: Readonly<SupportInfo> = { emojiSequence: false, combining: true, surrogates: true, tabSize: 8 };
/** @internal */
export const mintty: Readonly<SupportInfo> = { emojiSequence: false, combining: true, surrogates: true, tabSize: 8 };
