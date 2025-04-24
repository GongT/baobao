import { md5 } from '@idlebox/node';
import type { OutputFile as IOutputFile } from 'esbuild';

export class OutputFile implements IOutputFile {
	private _contents?: Uint8Array;
	private _text?: string;
	private _hash: string;

	get contents(): Uint8Array {
		if (this._contents === undefined) {
			if (this._text === undefined) throw new Error('contents is undefined');
			this._contents = Buffer.from(this._text, 'utf-8');
			this._text = undefined;
		}
		return this._contents;
	}
	set contents(contents: Buffer) {
		this._text = undefined;
		this._contents = contents;
	}

	get text(): string {
		if (this._text === undefined) {
			if (this._contents === undefined) throw new Error('contents is undefined');
			this._text = this._contents.toString();
			this._contents = undefined;
		}
		return this._text;
	}
	set text(text: string) {
		this._contents = undefined;
		this._text = text;
	}

	asString() {
		if (this._text) {
			return this._text;
		}
		if (this._contents) {
			return this._contents.toString();
		}
		throw new Error('text/contents is undefined');
	}

	asBinary(): Uint8Array {
		if (this._text) {
			return Buffer.from(this._text);
		}
		if (this._contents) {
			return this._contents;
		}
		throw new Error('text/contents is undefined');
	}

	asAny() {
		return this._contents ?? this._text ?? '';
	}

	get hash() {
		return this._hash;
	}

	set hash(_: any) {
		throw new Error('can not set hash');
	}

	constructor(
		public path: string,
		init: Uint8Array | string,
		hash = md5(init)
	) {
		if (typeof init === 'string') this._text = init;
		else this._contents = init;

		this._hash = hash;
	}
}
