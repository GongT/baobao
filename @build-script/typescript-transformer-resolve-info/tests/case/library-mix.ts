import { PassThrough } from 'stream';
import {
	Async,
	BlackHoleStream,
	normalizePath as TestValueAsType,
	NormalizePathFunction,
	PATH_SEPARATOR,
	PathEnvironment,
} from '@idlebox/node';

export type InterfaceReturn = () => NormalizePathFunction;
export type ClassReturn = () => PathEnvironment;

export class TestImplInterface extends PassThrough implements BlackHoleStream {
	method(): Async | void {
		console.log([typeof TestValueAsType, PATH_SEPARATOR]);
	}
}
