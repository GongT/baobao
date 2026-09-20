declare var AbortController: {
	prototype: AbortController;
	new (): AbortController;
};

interface AddEventListenerOptions {
	once?: boolean;
	signal?: AbortSignal;
}

interface Event {
	readonly type: string;
}

interface EventListener {
	(evt: Event): void;
}

declare interface AbortController {
	readonly signal: AbortSignal;
	abort(reason?: any): void;
}

declare interface AbortSignal {
	readonly aborted: boolean;
	readonly reason: any;
	throwIfAborted(): void;
	addEventListener(type: 'abort', listener: EventListener, options?: AddEventListenerOptions): void;
	removeEventListener(type: 'abort', listener: EventListener): void;
}
