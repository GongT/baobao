## API Report File for "cjke-strings"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts
// Warning: (ae-missing-release-tag) "allSupport" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const allSupport: SupportInfo;

// Warning: (ae-missing-release-tag) "CodePointInfo" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface CodePointInfo {
	// (undocumented)
	data: string;
	// (undocumented)
	length: number;
	// (undocumented)
	visible: boolean;
	// (undocumented)
	width: number;
}

// Warning: (ae-missing-release-tag) "combiningCharactersRegex" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const combiningCharactersRegex: RegExp;

// Warning: (ae-missing-release-tag) "emojiRegex" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const emojiRegex: RegExp;

// Warning: (ae-missing-release-tag) "emojiRegexStarting" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const emojiRegexStarting: RegExp;

// Warning: (ae-missing-release-tag) "emojiSimpleRegex" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const emojiSimpleRegex: RegExp;

// Warning: (ae-missing-release-tag) "isCombiningCharacters" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isCombiningCharacters(code: number): boolean;

// Warning: (ae-missing-release-tag) "LimitResult" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface LimitResult {
	// (undocumented)
	result: string;
	// (undocumented)
	toString(): string;
	// (undocumented)
	width: number;
}

// Warning: (ae-missing-release-tag) "limitWidth" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function limitWidth(original: string, limit: number, supports?: SupportInfo): LimitResult;

// Warning: (ae-missing-release-tag) "mintty" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const mintty: SupportInfo;

// Warning: (ae-missing-release-tag) "readFirstCompleteChar" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function readFirstCompleteChar(str: string, supports?: SupportInfo): CodePointInfo;

// Warning: (ae-missing-release-tag) "stringWidth" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function stringWidth(str: string, supports?: SupportInfo): number;

// Warning: (ae-missing-release-tag) "SupportInfo" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface SupportInfo {
	// (undocumented)
	combining: boolean;
	// (undocumented)
	emojiSequence: boolean;
	// (undocumented)
	surrogates: boolean;
}

// Warning: (ae-missing-release-tag) "unicodeEscape" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function unicodeEscape(str: string): string;

// Warning: (ae-missing-release-tag) "windowsConsole" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const windowsConsole: SupportInfo;

// (No @packageDocumentation comment for this package)
```
