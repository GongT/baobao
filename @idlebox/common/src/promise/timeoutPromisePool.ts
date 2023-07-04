import { TimeoutError } from '../lifecycle/timeout/timeoutError';
import { PromisePool } from './promisePool';

export class TimeoutPromisePool extends PromisePool {
	constructor(private readonly defaultTimeoutMs = 50000) {
		super();
	}

	override create(id: string, timeoutMs: number = this.defaultTimeoutMs, timeoutMsg?: string) {
		const p = super.create(id);

		const to = setTimeout(() => {
			this.error(id, new TimeoutError(timeoutMs, timeoutMsg));
		}, timeoutMs);

		p.finally(() => {
			clearTimeout(to);
		});

		return p;
	}
}
