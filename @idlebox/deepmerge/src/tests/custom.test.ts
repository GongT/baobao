import { expect } from 'chai';
import { describe, it } from 'mocha';
import { deepmerge, type MergeStrategy } from '../index.js';
import { invalid_function, test1a, test1b } from './data.test.js';

describe('custom strategy', () => {
	it('should merge', () => {
		const customStrategy: MergeStrategy = {
			primitive: (left) => left,
			array: (left) => left,
			object: (left, _right, keypath) => {
				if (keypath.length) {
					return left;
				}
				return undefined;
			},
		};

		const result = deepmerge({ a: test1a }, { a: test1b }, customStrategy);
		expect(result.a).to.equals(test1a);
	});
});

describe('custom class', () => {
	it('should merge', () => {
		class CustomClass {
			constructor(public value: string) {}
		}

		const customStrategy: MergeStrategy = {
			primitive: invalid_function('primitive'),
			array: invalid_function('array'),
			object: (left, right, keypath) => {
				if (keypath.length) {
					invalid_function('object')(left, right, keypath);
				}
				return undefined;
			},
			special: new Map([[CustomClass, (left, right) => new CustomClass(left.value + ' ' + right.value)]]),
		};

		const result = deepmerge({ a: new CustomClass('Hello') }, { a: new CustomClass('World') }, customStrategy);
		expect(result.a).to.be.instanceOf(CustomClass);
		expect(result.a.value).to.equals('Hello World');
	});
});
