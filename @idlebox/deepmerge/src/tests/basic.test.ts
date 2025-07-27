import { expect } from 'chai';
import { describe, it } from 'mocha';
import { deepmerge } from '../index.js';
import { test1a, test1b } from './data.test.js';

describe('deepmerge', () => {
	const result1 = {
		...test1a,
		...test1b,
	};

	it('should merge two objects', () => {
		const result = deepmerge(test1a, test1b);
		expect(result).to.deep.equals(result1);
	});
	it('should merge two objects deeply', () => {
		const result = deepmerge({ a: { b: { c: test1a } } }, { a: { b: { c: test1b } } });
		expect(result).to.deep.equals({ a: { b: { c: result1 } } });
	});
});
