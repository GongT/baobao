export class OutputFile {
	private _contents?: Buffer;
	private _text?: string;

	get contents(): Buffer {
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
			this.text = this._contents!.toString('utf-8');
		}
		return this._text!;
	}
	set text(text: string) {
		delete this._contents;
		this._text = text;
	}

	constructor(
		public path: string,
		init: Buffer | string
	) {
		if (typeof init === 'string') this.text = init;
		else this.contents = init;
	}
}
