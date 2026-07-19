export function noop() {}

export function negativeNoop(error: Error) {
	return function noop() {
		throw error;
	};
}
