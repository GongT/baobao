export async function awaitIterator<T>(generator: Iterator<T>): Promise<T> {
	let lastValue: any = {};
	do {
		const itr: IteratorResult<any> = generator.next(lastValue);
		if (itr.done) {
			return itr.value || lastValue;
		}
		if (itr.value[Symbol.iterator]) {
			lastValue = await awaitIterator(<any>itr.value);
		} else if (itr.value.then) {
			lastValue = await itr.value;
		} else {
			lastValue = itr.value;
		}
	} while (true);
}
