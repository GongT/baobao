import { DeferredPromise, Emitter, type IDisposable } from '@idlebox/common';

const DELAY_CLOSE_MOUTH = 700;

export class StreamAppender {
	private readonly dfd = new DeferredPromise<void>();
	private readonly queue: ArrayBuffer[] = [];
	private _finished = false;

	constructor(private readonly stream: SourceBuffer) {
		stream.mode = 'sequence';

		stream.addEventListener('updateend', this._pump.bind(this));
		stream.addEventListener('error', this._error.bind(this));
	}

	private _pump() {
		// console.log('[stream] pump %s', this.queue.length);
		if (this.stream.updating) {
			// console.error('   - busy');
			return;
		}
		const next = this.queue.shift();
		if (next) {
			// console.log('playing %s bytes', next.byteLength);
			this.stream.appendBuffer(next);
		} else if (this._finished) {
			// console.log('StreamAppender: dispose');
			this.dfd.complete();
		}
	}

	private _error(e: Event) {
		// console.log('[stream] pump fail', e);
		this.queue.length = 0;
		this.finish();

		const err = (e as any).error;
		if (!(err instanceof Error)) {
			console.error('e似乎不是ErrorEvent', e);
		}
		this.dfd.error(err);
	}

	append(buffer: ArrayBuffer) {
		if (this._finished) {
			throw new Error('不能在finish之后append');
		}

		this.queue.push(buffer);
		if (!this.stream.updating) {
			// console.log('[stream] pump start');
			this._pump();
		} else {
			// console.log('[stream] queue data');
		}
	}

	finish() {
		// console.log('[stream] done.');
		this._finished = true;
		this._pump();
	}

	terminate() {
		// console.log('[stream] done. (terminate)');
		this._finished = true;
		this.queue.length = 0;
		this._pump();
	}

	wait(): Promise<void> {
		return this.dfd.p;
	}
}

export class MediaForPlayback {
	private readonly mediaSource: MediaSource;
	public readonly ready: Promise<void>;
	private readonly endDfd = new DeferredPromise<void>();

	public readonly id: number;

	// biome-ignore lint/correctness/noUnusedPrivateClassMembers: bug
	private static guid = 0;

	constructor() {
		this.id = ++MediaForPlayback.guid;
		// console.log('[media source %d] create', this.id);

		const source = new window.MediaSource();
		this.ready = new Promise<void>((resolve) => {
			const wrap = () => {
				source.removeEventListener('sourceopen', wrap);
				// console.log('[media source %d] sourceopen', this.id);
				resolve();
			};
			source.addEventListener('sourceopen', wrap);
		});
		this.mediaSource = source;
	}

	private opened = false;
	async open(mime: string) {
		if (this.opened) throw new Error('duplicate call to MediaForPlayback.open()');
		this.opened = true;

		// console.log('[media source %d] open', this.id, mime);
		await this.ready;

		const buffer = this.mediaSource.addSourceBuffer(mime);
		const appender = new StreamAppender(buffer);
		appender.wait().finally(() => {
			// console.log('[media source %d] appender finished', this.id);

			this.mediaSource.endOfStream();
			this.endDfd.complete();
			this.dispose();
		});

		return appender;
	}

	playToNewAudioElement() {
		const audio = new HtmlAudioPlayer();

		audio.onEnd(() => {
			this.dispose();
		});
		audio.element.src = URL.createObjectURL(this.mediaSource);

		return audio;
	}

	public finish(): Promise<void> {
		return this.endDfd.p;
	}

	private disList: IDisposable[] = [];
	_register(d: IDisposable) {
		this.disList.push(d);
	}

	dispose() {
		// console.log('[media source %d] dispose()', this.id);
		for (const obj of this.disList) {
			obj.dispose();
		}
	}
}

export class HtmlAudioPlayer {
	public readonly element: HTMLAudioElement;

	private readonly _humanSpeaking = new Emitter<boolean>();
	public readonly onHumanSpeaking = this._humanSpeaking.event;

	constructor() {
		const audio = new Audio();
		this.element = audio;

		// for (const n of mdevents) {
		// 	audio.addEventListener(n, () => {
		// 		console.log('[audio] event: %s', n);
		// 	});
		// }

		audio.addEventListener('ended', () => {
			this.dispose();
		});
		audio.addEventListener('canplay', () => {
			this.aboutToSetSpeaking(true);
		});
		audio.addEventListener('pause', () => {
			this.aboutToSetSpeaking(false);
		});
		audio.addEventListener('waiting', () => {
			this.aboutToSetSpeaking(false, DELAY_CLOSE_MOUTH / 2);
		});

		audio.autoplay = true;
	}

	private tmr?: number;
	private aboutToSetSpeaking(target: boolean, timeout = DELAY_CLOSE_MOUTH) {
		if (this.tmr) {
			clearTimeout(this.tmr);
			this.tmr = 0;
		}

		if (target) {
			this._moveSpeakState(true);
		} else {
			this.tmr = setTimeout(() => {
				this.tmr = 0;

				this._moveSpeakState(false);
			}, timeout);
		}
	}

	private speaking = false;
	private _moveSpeakState(target: boolean) {
		if (this.speaking === target) return;

		this.speaking = target;
		// console.log('human-speaking:', target);
		this._humanSpeaking.fireNoError(this.speaking);

		if (this.disposed) {
			this._humanSpeaking.dispose();
		}
	}

	private disposed = false;
	dispose() {
		// console.log('HtmlAudioPlayer: dispose');
		this.disposed = true;

		disposeAudioElement(this.element);

		if (this.speaking) {
			this.aboutToSetSpeaking(false);
		} else {
			this._humanSpeaking.dispose();
		}
	}

	onEnd(fn: () => void) {
		if (this.element.ended) {
			fn();
		} else {
			const once = () => {
				fn();
				this.element.removeEventListener('ended', once);
			};
			this.element.addEventListener('ended', once);
		}
	}
}

export function disposeAudioElement(audio: HTMLAudioElement) {
	if (!audio.ended && !('__my_end' in audio)) {
		Object.assign(audio, { __my_end: true });
		const ee = new Event('ended');
		Object.assign(ee, { error: new Error('canceled') });
		audio.dispatchEvent(ee);
	}
}

// @ts-ignore
// biome-ignore lint/correctness/noUnusedVariables: debug
const mdevents = [
	'abort',
	'canplay',
	'canplaythrough',
	'durationchange',
	'emptied',
	'encrypted',
	'ended',
	'error',
	'loadeddata',
	'loadedmetadata',
	'loadstart',
	'pause',
	'play',
	'playing',
	'progress',
	'ratechange',
	'seeked',
	'seeking',
	'stalled',
	'suspend',
	'timeupdate',
	'volumechange',
	'waiting',
	'waitingforkey',
];
