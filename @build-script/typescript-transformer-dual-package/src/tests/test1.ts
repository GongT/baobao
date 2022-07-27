import 'typescript';
import { IInterface } from './types';
import { Type } from './types';
import { TestClass } from './types';
import { variable } from './types';
import { testFunction } from './types';
import * as t from '@T/types';

new t.TestClass();

let a: IInterface = {} as any;
let b: Type = {} as any;

console.log('import.meta.url =', import.meta.url);

if (1 + 1 > 2) {
	console.log(a);
	console.log(b);
	console.log(TestClass);
	console.log(variable);
	console.log(testFunction);
}
