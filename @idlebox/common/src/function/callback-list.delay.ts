export interface MyDelayCallback<Argument extends unknown[]> {
	displayName?: string;
	(...param: Argument): void;
}

/**
 * remember arguments after run
 * run all later added function with memorized argument
 */
export class MemorizedOnceCallbackList<Argument extends unknown[]> {
	protected list: MyDelayCallback<Argument>[] = [];

	count() {
		return this.list.length;
	}

	add(item: MyDelayCallback<Argument>) {
		this.list.push(item);
	}

	run(...args: Argument) {
		this.add = (item) => {
			item(...args);
		};
		for (const item of this.list) {
			item(...args);
		}
	}
}
