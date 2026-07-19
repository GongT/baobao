import { expect, it } from 'vitest';
import { arrayChunk } from './chunk.js';
import { arrayDiff } from './diff.js';
import { isArraySame } from './is-same.js';
import { arrayUnique, arrayUniqueReference, uniqueFilter } from './unique.js';

it('arrayChunk', () => {
	const result = Array.from(arrayChunk([1, 2, 3, 4, 5], 2));

	expect(result).toEqual([[1, 2], [3, 4], [5]]);
});

it('arrayDiff', () => {
	const arrayA = ['a', 'b', 'c', 'd', 1];
	const arrayB = ['b', 'c', '1', 2, 3];

	const result = arrayDiff(arrayA, arrayB);

	expect(result.add).toEqual(expect.arrayContaining(['1', 2, 3]));
	expect(result.del).toEqual(expect.arrayContaining(['a', 'd', 1]));
	expect(result.same).toEqual(expect.arrayContaining(['b', 'c']));
});

it('isSame', () => {
	const arrayA = ['a', 'b', 'c', 'd', 1];
	const arrayB = ['a', 'b', 'c', 'd', 1];
	const arrayC = ['a', 'b', 'c', 'd', '1'];
	const arrayD = ['a', 'b'];
	const arrayE = ['a', 'b', 'c', 'd', 1, 2];
	const arrayF = ['a', 'c', 'b', 'd', 1];

	expect(isArraySame(arrayA, arrayB)).toEqual(true);
	expect(isArraySame(arrayA, arrayC)).toEqual(false);
	expect(isArraySame(arrayA, arrayD)).toEqual(false);
	expect(isArraySame(arrayA, arrayE)).toEqual(false);
	expect(isArraySame(arrayA, arrayF)).toEqual(false);
});

it('去重', () => {
	const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];

	const newArr = arrayUnique(arr);

	expect(newArr).toEqual([1, 2, 3, 4, 5]);
	expect(arr.length).toEqual(10);

	arrayUniqueReference(arr);
	expect(arr).toEqual([1, 2, 3, 4, 5]);

	const objArr = [{ id: 1 }, { id: 2 }, { id: 1 }, { id: 3 }];
	function getId(item: { id: number }) {
		return item.id.toString();
	}
	const filtered = objArr.filter(uniqueFilter(getId));
	expect(filtered).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);
});
