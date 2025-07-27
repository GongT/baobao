import { expect } from 'chai';
import { describe, it } from 'mocha';
import { type MergeStrategy, custom, deepmerge } from '../index.js';
import { invalid_function } from './data.test.js';

class Test {
	constructor(public value: string) {}
	[custom](b: Test, _keypath: string) {
		return this.value + ' ' + b.value;
	}
}

describe('custom symbol', () => {
	it('should merge', () => {
		const customStrategy: MergeStrategy = {
			primitive: invalid_function('primitive'),
			array: invalid_function('array'),
			object: invalid_function('object'),
			special: new Map([[Test, invalid_function('special')]]),
		};

		const result = deepmerge(new Test('Hello'), new Test('World'), customStrategy);
		expect(result).to.equals('Hello World');
	});
});
