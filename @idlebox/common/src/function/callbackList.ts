import { nameFunction } from './functionName.js';

export interface MyCallback<Argument extends unknown[]> {
	displayName?: string;

	(...param: Argument): any;
}

/**
 * Manage a list of callback
 */
export class CallbackList<Argument extends unknown[]> {
	protected list: MyCallback<Argument>[] = [];
	protected running: boolean = false;
	protected stop: boolean = false;

	constructor() {
		this.run = (this.run as any).bind(this);
	}

	count() {
		return this.list.length;
	}

	/**
	 * remove all callback
	 */
	reset() {
		if (this.running) {
			throw new Error("Can not reset when it's running.");
		}
		this.list.length = 0;
	}

	/**
	 * @param name optional name of `item` (will assign displayName to `item`)
	 * @returns function list length
	 */
	add(item: MyCallback<Argument>, name?: string): number {
		if (this.running) {
			throw new Error("Can not add callback when it's running.");
		}
		if (name) {
			nameFunction(name, item);
		}
		return this.list.push(item);
	}

	/**
	 * @returns if removed: return `item`; if did not exists: return null
	 */
	remove(item: MyCallback<Argument>): null | MyCallback<Argument> {
		if (this.running) {
			throw new Error("Can not remove callback when it's running.");
		}
		const found = this.list.indexOf(item);
		if (found !== -1) {
			return this.list.splice(found, 1)[0]!;
		}
		return null;
	}

	/**
	 * in a callback, call this.stopRun() to stop remain callbacks (not by return false)
	 * @returns {boolean} true if every callback called, false if stop in middle
	 */
	run(...argument: Argument): boolean {
		if (this.running) {
			throw new Error("can not run CallbackList in it's callback.");
		}
		this.stop = false;

		this.running = true;
		for (const cb of this.list) {
			if (this.stop) break;
			cb(...argument);
		}
		this.running = false;

		const ret = !this.stop;
		this.stop = false;
		return ret;
	}

	stopRun() {
		this.stop = true;
	}
}
