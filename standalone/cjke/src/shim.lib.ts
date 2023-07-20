declare const require: any;

const cjs = typeof require !== 'undefined';
if (cjs) {
	require('@gongt/fix-esm').register();
}

import ansiRegexConstructor from 'ansi-regex';
import isFullwidthCodePoint from 'is-fullwidth-code-point';

if (cjs) {
	require('@gongt/fix-esm').unregister();
}


/** @internal */
export const ansiRegexConstructorLibrary = ansiRegexConstructor;

/** @internal */
export const isFullwidthCodePointLibrary = isFullwidthCodePoint;
