declare const require: any;

const cjs = typeof require !== 'undefined';
if (cjs) {
	require('fix-esm').register();
}

import ansiRegexConstructor from 'ansi-regex';
import isFullwidthCodePoint from 'is-fullwidth-code-point';

if (cjs) {
	require('fix-esm').unregister();
}


/** @internal */
export const ansiRegexConstructorLibrary = ansiRegexConstructor;

/** @internal */
export const isFullwidthCodePointLibrary = isFullwidthCodePoint;
