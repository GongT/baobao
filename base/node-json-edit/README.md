# node-json-edit

A tool for read and write json file.

Preserve file format between read and write:
* Empty line at end.
* Indention.
* Line feed type.
* Charset.

Additional:
* Insert property at alphabet order, not at last.
* Configurable format.

Recommend: `editorconfig` is good.

## Usage
```typescript
export declare enum LineFeed {
    NONE = 0,
    CRLF = 1,
    LF = 2
}
export interface IFileFormatConfig {
    tabs: string;
    lineFeed: LineFeed;
    lastNewLine: boolean;
    encoding?: string;
}
export declare const defaultConfig: IFileFormatConfig;
export declare function writeJsonFile(file: string, data: any): Promise<void>;
export declare function loadJsonFile(file: string, charset?: string): Promise<any>;
export declare function parseJsonText(text: string): any;
export declare function stringifyJsonText(data: any): string;
export declare function insertKeyAlphabet<T = any>(obj: T, key: any, value: any): T;
export declare function reformatJson<T = any>(data: T, format: Partial<IFileFormatConfig>): T;
export declare function getFormatInfo(data: any): IFileFormatConfig | undefined;
```
