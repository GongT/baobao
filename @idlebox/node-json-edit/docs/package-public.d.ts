/// <reference types="node" />
// file: lib/api/manipulate.d.ts
export declare enum UnorderdFieldsPlacement {
    PREPEND = 0,
    APPENND = 1
}
export declare function manipulateJsonResult(data: any, oType?: UnorderdFieldsPlacement): any;
export declare function insertKeyAlphabet(data: any, key: any, value: any): typeof data;
export declare function sortObjectWithTargetOrder(data: any, targetOrder: string[]): typeof data;


// file: lib/api/format.d.ts
import { doc, Options as PrettierOptions } from 'prettier';
declare type PassedEditableFormats = 'bracketSpacing' | 'endOfLine';
export interface IFileFormatConfig extends doc.printer.Options, Pick<PrettierOptions, PassedEditableFormats> {
    lastNewLine: boolean;
}
export declare function reformatJson<T = any>(data: T, format: Partial<IFileFormatConfig>): T;
export declare function stringifyJsonText(data: any): string;
export declare function getFormatInfo(data: any): IFileFormatConfig;
export {};


// file: lib/api/readwrite.d.ts
/**
 * When writeXxx() functions return a bool, it means:
 *   * true: data has change, file content altered
 *   * false: data did not change, no write happen
 */
/// <reference types="node" />
/**
 * @see {writeJsonFileBackForce}
 * Synchronize operation
 */
export declare function writeJsonFileBackForceSync(data: any): void;
/**
 * Unconditional write `data` back into it's source file
 */
export declare function writeJsonFileBackForce(data: any): Promise<void>;
/**
 * @see {writeJsonFileBack}
 * Synchronize operation
 */
export declare function writeJsonFileBackSync(data: any): boolean;
/**
 * Check if `data` has changed, if so, write it back into it's source file
 */
export declare function writeJsonFileBack(data: any): Promise<boolean>;
/**
 * @see {writeJsonFile}
 * Synchronize operation
 */
export declare function writeJsonFileSync(file: string, data: any, charset?: BufferEncoding): boolean;
/**
 * check if `data` is same with content of `file`, if not, overwrite `file`
 */
export declare function writeJsonFile(file: string, data: any, charset?: BufferEncoding): Promise<boolean>;
export declare function loadJsonFileIfExistsSync(file: string, defaultValue?: any, charset?: BufferEncoding): Promise<any>;
export declare function loadJsonFileIfExists(file: string, defaultValue?: any, charset?: BufferEncoding): Promise<any>;
export declare function loadJsonFileSync(file: string, charset?: BufferEncoding): any;
export declare function loadJsonFile(file: string, charset?: BufferEncoding): Promise<any>;
export declare function parseJsonText(text: string): any;


