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

const check1 = new ObjectPath(objects[1]);
if (check1.get(['a', 'b', 'c', 'd']) !== 1) {
	console.error('get fail');
} else {
	console.log('get ok');
}

console.log(check1.get(['a', 'b', 'c']));

const check2 = new ObjectPath(objects[0]);

check2.set(['value', 'a'], 2);
check2.set(['value', 'b', 'x'], undefined);
check2.set(['value', 'c', 'x'], undefined);

console.log(objects[0]);
