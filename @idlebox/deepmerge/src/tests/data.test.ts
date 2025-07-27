export const test1a = {
	a: null,
	foo: 'bar',
	arr: [1, 2, 3],
	date: new Date('2020-01-01'),
	fn() {
		return 1;
	},
};

export const test1b = {
	b: undefined,
	foo: 'baz',
	arr: [4, 5],
	date: new Date('2025-01-01'),
	fn() {
		return 2;
	},
};

export function invalid_function(name: string) {
	return (..._args: any[]) => {
		throw new Error(`${name} function should not be called`);
	};
}
