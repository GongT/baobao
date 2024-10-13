import { md5 } from '@idlebox/node';
import type { OutputFile as IOutputFile } from 'esbuild';

export class OutputFile implements IOutputFile {
	private _contents?: Uint8Array;
	private _text?: string;
	private _hash: string;

	get contents(): Uint8Array {
		if (typeof this._contents === 'undefined') {
			this.contents = Buffer.from(this._text!, 'utf-8');
		}
		return this._contents!;
	}
	set contents(contents: Buffer) {
		delete this._text;
		this._contents = contents;
	}

	get text(): string {
		if (typeof this._text === 'undefined') {
			this.text = this._contents!.toString();
		}
		return this._text!;
	}
	set text(text: string) {
		delete this._contents;
		this._text = text;
	}

	asString() {
		return this._text ?? this._contents!.toString();
	}
	asBinary(): Uint8Array {
		return this._contents ?? Buffer.from(this._text!, 'utf-8');
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
		hash = md5(init),
	) {
		if (typeof init === 'string') this._text = init;
		else this._contents = init;

		this._hash = hash;
	}
}
