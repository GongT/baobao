export function debounce(fn: () => void) {
	let scheduling = false;

	return function debounced() {
		if (scheduling) return;

		scheduling = true;
		process.nextTick(() => {
			scheduling = false;
			fn();
		});
	};
}
