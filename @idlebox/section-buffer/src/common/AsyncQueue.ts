import { createStackTraceHolder, Disposed, Emitter, SimpleStateMachine, type IStateChangeEvent, type StackTraceHolder } from '@idlebox/common';

function immediate() {
	return new Promise<void>((resolve) => {
		setImmediate(resolve);
	});
}

enum State {
	idle = 0, // = 'idle',
	prepareWork = 1, // = 'prepareWork',
	working = 2, // = 'working',
	waitting = 3, // = 'waitting',
	dispose = 4, // = 'dispose',
}

enum Event {
	recvTask = 0, // = 'recvTask',
	taskDone = 1, // = 'taskDone',
	schedule = 2, // = 'schedule',
	dispose = 3, // = 'dispose',
	cancel = 4,
}

const rules = new Map([
	[
		State.idle,
		new Map([
			[Event.recvTask, State.prepareWork],
			[Event.dispose, State.dispose],
			[Event.cancel, State.idle],
		]),
	],
	[
		State.prepareWork,
		new Map([
			[Event.recvTask, State.prepareWork],
			[Event.schedule, State.working],
			[Event.dispose, State.dispose],
			[Event.cancel, State.idle],
		]),
	],
	[
		State.working,
		new Map([
			[Event.recvTask, State.waitting],
			[Event.taskDone, State.idle],
			[Event.dispose, State.dispose],
			[Event.cancel, State.working],
		]),
	],
	[
		State.waitting,
		new Map([
			[Event.recvTask, State.waitting],
			[Event.taskDone, State.prepareWork],
			[Event.dispose, State.dispose],
			[Event.cancel, State.working],
		]),
	],
	[State.dispose, new Map()],
]);

export class LossyAsyncQueue<T = void> {
	private state = new SimpleStateMachine(rules, State.idle);

	private _promise: Promise<void> | undefined;
	private disposed: StackTraceHolder | undefined;

	private readonly _onError = new Emitter<Error>();
	public readonly onError = this._onError.register;

	private readonly _onComplete = new Emitter<void>();
	public readonly onComplete = this._onComplete.register;

	private readonly _onBusy = new Emitter<boolean>();
	public readonly onBusy = this._onBusy.register;
	private task?: T;

	constructor(private readonly callback: (arg: T) => Promise<void>) {
		this.state.onStateChange(this.handleStateChange.bind(this));
	}

	private handleStateChange(ev: IStateChangeEvent<State, Event>) {
		// console.log('[AsyncQueue] state: %s => %s', ev.from, ev.to);
		if (ev.from === State.idle && ev.to === State.prepareWork) {
			// console.log('[AsyncQueue] schedule work');

			if (this._promise) throw new Error('invalid program state');
			this._promise = this._execute();
		} else if (ev.from === State.idle && ev.to === State.idle) {
			this.task = undefined;
		} else if (ev.from === State.prepareWork && ev.to === State.working) {
			// console.log('[AsyncQueue] start working');
		} else if (ev.from === State.prepareWork && ev.to === State.prepareWork) {
			// empty
		} else if (ev.from === State.prepareWork && ev.to === State.idle) {
			this.task = undefined;
		} else if (ev.from === State.working && ev.to === State.idle) {
			// console.log('[AsyncQueue] finish working (%s)', this.state.getName());

			if (!this._promise) throw new Error('invalid program state');
			this._promise = undefined;
			this._onBusy.fire(false);
		} else if (ev.from === State.working && ev.to === State.waitting) {
			this._onBusy.fire(true);
		} else if (ev.from === State.working && ev.to === State.working) {
			// empty
		} else if (ev.from === State.waitting && ev.to === State.prepareWork) {
			// console.log('[AsyncQueue] re-schedule work');

			if (!this._promise) throw new Error('invalid program state');
			this._promise = this._execute();
		} else if (ev.from === State.waitting && ev.to === State.waitting) {
			this._onBusy.fire(true);
		} else if (ev.from === State.waitting && ev.to === State.working) {
			this.task = undefined;
		} else if (ev.to === State.dispose) {
			// empty
		} else {
			throw new Error('known state change');
		}
	}

	private _lock = false;
	lock(l: boolean) {
		this._lock = l;
		if (l) this.state.change(Event.cancel);
	}

	private async _execute() {
		await immediate();
		if (this.state.getName() === State.dispose) return;

		const task = this.task!;
		this.task = undefined;

		this.state.change(Event.schedule);

		try {
			// console.log('[AsyncQueue] call');
			await this.callback(task);
			this._onComplete.fireNoError();
		} catch (e: any) {
			this._onError.fireNoError(e);
		}

		if (this.state.getName() === State.dispose) return;
		this.state.change(Event.taskDone);
	}

	get promise() {
		return this._promise;
	}

	pushQueue(arg: T) {
		if (this.disposed) throw new Disposed('async queue was disposed', this.disposed);

		// console.log('[AsyncQueue] queue: promise=%s, state=%s', !!this._promise, this.state.getName());

		this.task = arg;

		if (this._lock) return;

		this.state.change(Event.recvTask);
	}

	async dispose() {
		if (this.disposed) return;

		this.disposed = createStackTraceHolder('disposed');

		// console.log('[AsyncQueue] to dispose: promise=%s, state=%s', !!this._promise, this.state.getName());
		this.state.change(Event.dispose);

		if (this._promise) {
			await this._promise;
		}

		this._onBusy.dispose();
		this._onError.dispose();
		this._onComplete.dispose();
	}
}
