interface IUniqueIdFactory<T> {
	(item: T): string;
}

function defaultFactory(t: any) {
	return t as string;
}

/** @internal */
export function uniqueFilter<T>(idFactory: IUniqueIdFactory<T> = defaultFactory) {
	const seen: { [id: string]: true } = {};
	return function uniqueFilter(item: T): boolean {
		const id = idFactory(item);
		if (seen[id]) {
			return false;
		} else {
			seen[id] = true;
			return true;
		}
	};
}
