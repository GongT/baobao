import { expect, test } from 'vitest';
import { ObjectPath } from './objectPath.js';

const objects = [
	{
		value: {
			a: 1,
			b: {
				x: 1,
			},
			c: {
				x: 1,
				y: 2,
			},
		},
	},
	{
		a: {
			b: {
				c: {
					d: 1,
				},
			},
		},
	},
];

test('深层获取', () => {
	const check = new ObjectPath(objects[1]);
	expect(check.get(['a', 'b', 'c', 'd'])).toBe(1);
	expect(check.get(['a', 'b', 'c'])).toEqual({ d: 1 });
});

test('存在性检查', () => {
	const check = new ObjectPath(objects[1]);
	expect(check.exists(['a', 'b', 'c', 'd'])).toBe(true);
	expect(check.exists(['a', 'b', 'c'])).toBe(true);
	expect(check.exists(['a', 'b', 'd'])).toBe(false);
});

test('深层赋值与删除', () => {
	const check = new ObjectPath(objects[0]);

	check.set(['value', 'a'], 2);
	check.set(['value', 'b', 'x'], undefined);
	check.set(['value', 'c', 'x'], undefined);

	expect(objects[0]).toEqual({
		value: {
			a: 2,
			c: {
				y: 2,
			},
		},
	});
});
