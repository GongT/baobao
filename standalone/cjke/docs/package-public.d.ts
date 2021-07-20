export declare const allSupport: SupportInfo;

export declare interface CodePointInfo {
    data: string;
    width: number;
    length: number;
    visible: boolean;
}

export declare const combiningCharactersRegex: RegExp;

export declare const emojiRegex: RegExp;

export declare const emojiRegexStarting: RegExp;

export declare const emojiSimpleRegex: RegExp;

export declare function isCombiningCharacters(code: number): boolean;

export declare interface LimitResult {
    toString(): string;
    result: string;
    width: number;
}

export declare function limitWidth(original: string, limit: number, supports?: SupportInfo): LimitResult;

export declare const mintty: SupportInfo;

export declare function readFirstCompleteChar(str: string, supports?: SupportInfo): CodePointInfo;

export declare function stringWidth(str: string, supports?: SupportInfo): number;

export declare interface SupportInfo {
    emojiSequence: boolean;
    combining: boolean;
    surrogates: boolean;
}

export declare function unicodeEscape(str: string): string;

export declare const windowsConsole: SupportInfo;

export { }
