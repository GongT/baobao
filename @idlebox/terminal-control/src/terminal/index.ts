import { EnhancedDisposable } from '@idlebox/common';
import type { WriteStream } from 'node:tty';
import * as characters from '../constants/characters.js';
import { ESC } from '../constants/characters.js';
import * as regexp from '../constants/regexp.js';
import * as sequence from '../constants/sequence.js';
import { AlternativeScreen } from '../functions/alternative.js';
import { Cursor } from '../functions/cursor.js';
import { Erase } from '../functions/erase.js';
import { DisabledProgress, Progress } from '../functions/progress.js';
import { Title } from '../functions/title.js';
import { Geometry } from './geometry.js';

const debugMsg = ' clear screen in debug mode ';
const debugMsgLength = debugMsg.length;

/*

export * as alternativeScreen from './functions/alternative.js';
export * as cursor from './functions/cursor.js';
export * as erase from './functions/erase.js';
export * as progress from './functions/progress.js';
export * as title from './functions/title.js';

*/

export class Terminal extends EnhancedDisposable {
	protected readonly std_stream: WriteStream;

	public declare readonly characters: Readonly<typeof characters>;
	public static readonly characters: Readonly<typeof characters> = characters;
	public declare readonly sequence: Readonly<typeof sequence>;
	public static readonly sequence: Readonly<typeof sequence> = sequence;
	public declare readonly regexp: Readonly<typeof regexp>;
	public static readonly regexp: Readonly<typeof regexp> = regexp;

	public declare readonly geometry: Geometry;
	public declare readonly alternativeScreen: AlternativeScreen;
	public declare readonly cursor: Cursor;
	public declare readonly erase: Erase;
	public declare readonly progress: Progress;
	public declare readonly title: Title;

	static {
		Object.assign(Terminal.prototype, { characters, sequence, regexp });
		defineAsGetter(Terminal.prototype, 'geometry', function (this: Terminal) {
			return new Geometry(this.std_stream);
		});
		defineAsGetter(Terminal.prototype, 'alternativeScreen', function (this: Terminal) {
			return this._register(new AlternativeScreen(this));
		});
		defineAsGetter(Terminal.prototype, 'cursor', function (this: Terminal) {
			return new Cursor(this);
		});
		defineAsGetter(Terminal.prototype, 'erase', function (this: Terminal) {
			return new Erase(this.stream);
		});
		defineAsGetter(Terminal.prototype, 'progress', function (this: Terminal) {
			if (this.isTTY) {
				return this._register(new Progress(this.stream));
			} else {
				return new DisabledProgress();
			}
		});
		defineAsGetter(Terminal.prototype, 'title', function (this: Terminal) {
			return this._register(new Title(this.stream));
		});
	}

	constructor(
		public readonly stream: NodeJS.WritableStream,
		public readonly readingSide?: NodeJS.ReadableStream,
	) {
		super(`terminal:${(stream as any).fd ?? 'stream'}`);
		this.std_stream = stream as WriteStream;
	}

	public requireReading() {
		if (!this.readingSide) throw new Error('the reading stream is not available');
		return this.readingSide;
	}

	/**
	 * 标准错误输出是否连接到TTY设备
	 */
	public get isTTY(): boolean {
		return this.std_stream.isTTY;
	}

	/**
	 * 如果是TTY设备，则重置终端
	 */
	public reset() {
		this.stream.write(`${ESC}c`);
	}

	/**
	 * 根据计算结果（如果为true）决定是否重置终端
	 * 如果不重置，但是在TTY上，则输出一行分割线
	 *
	 * @param really 是否重置终端
	 */
	public resetIf(really = true) {
		if (really) {
			this.reset();
		} else if (this.isTTY) {
			const half = Math.floor((this.geometry.width - debugMsgLength - 1) / 2);
			const line = '-'.repeat(half);

			this.stream.write(`\r\x1b[0;2m${line}${debugMsg}${line}\x1b[0m`);
		}
	}
}

function defineAsGetter(prototype: Terminal, key: string, getter: (this: Terminal) => any) {
	Object.defineProperty(prototype, key, {
		get(this: Terminal) {
			const instance = getter.call(this);
			Object.defineProperty(this, key, {
				value: instance,
				writable: false,
				enumerable: true,
				configurable: false,
			});
			return instance;
		},
		enumerable: true,
		configurable: true,
	});
}
