import { ApplicationArguments } from './library/reader.app.js';
import { tokenize as _tokenize } from './tools/tokenize.js';
import type { IArgsReaderApi, IArgumentList, IToken } from './types.js';
export * from './types.js'

/**
 * 创建一个ArgsReader
 * @param {readonly string[]} argv 传入的数组会被复制，因此构造后修改argv不影响当前对象
 * @returns {IArgsReaderApi}
 */
export function createArgsReader(argv: IArgumentList): IArgsReaderApi {
	return new ApplicationArguments(argv);
}

export * as ArgumentError from './library/errors.js';
export { printTwoColumn } from './tools/table.js';
export * as ArgumentTypings from './types.js';

export function tokenize(argv: IArgumentList): IToken[] {
	return _tokenize(argv).map((e) => e.valueOf());
}
