import { DuplicateCallError } from '@idlebox/errors';
import { createStackTraceHolder, type StackTraceHolder } from '../error/stack-trace.js';
import { functionName } from './object-with-name.js';

export interface IDuplicateCallTracer {
	/**
	 * 首次调用什么都不做，后续重复调用将抛出 DuplicateCallError。
	 */
	assert(fn?: Function): void;
	/**
	 * 确保该函数未被重复调用，但不会记录此次调用。
	 */
	never(): void;
	/**
	 * 测试该函数是否已经被调用过。
	 */
	test(): boolean;
}

class DuplicateCallTracer {
	private ever_called?: StackTraceHolder;

	constructor(private readonly fn: Function = this.assert) {}

	assert() {
		if (!this.ever_called) {
			this.ever_called = createStackTraceHolder('首次调用', this.assert);
			return;
		}

		throw new DuplicateCallError(this.fn, { cause: this.ever_called });
	}

	never() {
		if (this.ever_called) {
			throw new Error(`${functionName(this.fn)}: 已被调用过`);
		}
	}

	test() {
		return this.ever_called !== undefined;
	}
}

class DuplicateCallMarker {
	private called = false;

	constructor(private readonly fn: Function = this.assert) {}

	assert() {
		if (!this.called) {
			this.called = true;
			return;
		}

		throw new DuplicateCallError(this.fn);
	}

	never() {
		if (this.called) {
			throw new Error(`${functionName(this.fn)}: 已被调用过`);
		}
	}

	test() {
		return this.called;
	}
}

export function createDuplicateCallTracer(withTrace: boolean) {
	if (withTrace) {
		return new DuplicateCallTracer();
	} else {
		return new DuplicateCallMarker();
	}
}
