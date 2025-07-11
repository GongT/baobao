import { nameFunction } from './functionName.js';

export interface MyDelayCallback<Argument extends unknown[]> {
	displayName?: string;

	(...param: Argument): void;
}

/**
 * remember arguments after run
 * run all later added function with memorized argument
 */
export class DelayCallbackList<Argument extends unknown[]> {
	private delayArgument?: Argument;
	private delayComplete = false;

	protected list?: MyDelayCallback<Argument>[] = [];

	count() {
		return this.list?.length ?? 0;
	}

	add(item: MyDelayCallback<Argument>, name?: string) {
		if (name) {
			nameFunction(name, item);
		}
		if (this.delayComplete) {
			item(...this.delayArgument!);
		} else {
			this.list?.push(item);
		}
	}

	run(argument: Argument) {
		if (this.delayComplete) {
			throw new Error('call to delay callback twice!');
		}
		this.delayComplete = true;
		this.delayArgument = argument;
		this.list?.forEach((cb) => {
			cb(...argument);
		});
		this.list = undefined;
	}
}
