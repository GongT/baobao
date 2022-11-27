import 'typescript';
import { IInterface } from './virtual-path/types';
import { Type } from './virtual-path/types';
import { TestClass } from './virtual-path/types';
import { variable } from './virtual-path/types';
import { testFunction } from './virtual-path/types';
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
