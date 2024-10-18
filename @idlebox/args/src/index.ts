import type { IArgsReaderApi } from './interface.js';
import { type IParams, ArgsReader } from './library/args-reader.js';

export function createArgsReader(argv: IParams): IArgsReaderApi {
	return new ArgsReader(argv);
}
