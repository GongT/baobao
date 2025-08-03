import { readFile } from 'node:fs/promises';
import type { doc, Options as PrettierOptions } from 'prettier';
import { format, type Options, resolveConfig } from 'prettier';
import type { IFormatter } from '../api/types.js';
import { pathExists } from '../tools/filesystem.js';

type PassedEditableFormats = 'bracketSpacing' | 'endOfLine';

export interface IPrettyFormatConfig extends doc.printer.Options, Pick<PrettierOptions, PassedEditableFormats> {
	lastNewLine: boolean;
}

type ICfg = Partial<IPrettyFormatConfig>;

enum LineFeed {
	CRLF = 'crlf',
	LF = 'lf',
}

type PassedFormats = 'trailingComma' | 'parser' | 'filepath' | 'quoteProps';

export interface IInternalFormat extends IPrettyFormatConfig, Pick<Options, PassedFormats> {}

const defaultFormat: IInternalFormat = {
	parser: 'json',
	printWidth: 120,
	useTabs: true,
	tabWidth: 4,
	quoteProps: 'consistent',
	trailingComma: 'es5',
	bracketSpacing: true,
	endOfLine: 'lf',
	lastNewLine: false,
	__embeddedInHtml: false,
};

export class PrettierFormat implements IFormatter<ICfg> {
	constructor(private current: IInternalFormat = { ...defaultFormat }) {}

	static async createInstance(text?: string, file?: string) {
		const instance = new PrettierFormat();
		if (file) {
			await instance.learnFromFile(file, text);
		} else if (text) {
			instance.learnFromString(text);
		}
		return instance;
	}

	clone() {
		const copy = new PrettierFormat({ ...this.current });
		return copy;
	}

	setOptions(format: ICfg) {
		Object.assign(this.current, format);
	}

	async format(text: string) {
		const result = await format(text, {
			...this.current,
			parser: 'json',
			singleQuote: false,
			trailingComma: 'none',
			quoteProps: 'preserve',
		});
		return this.current.lastNewLine ? result : result.trim();
	}

	getOptions(): ICfg {
		return this.current;
	}

	async learnFromFile(file: string, content?: string) {
		const f = await resolveConfig(file, { editorconfig: true });
		if (f) {
			this.setOptions({ ...f, lastNewLine: true });
		} else if (await pathExists(file)) {
			this.current.filepath = file;
			if (!content) content = await readFile(file, 'utf-8');
			this.learnFromString(content);
		}
	}

	private learnFromString(text: string) {
		const someLineHasIndent = /^\s+/m.exec(text)?.[0];

		const config = this.current;

		config.endOfLine = text.includes('\r') ? LineFeed.CRLF : LineFeed.LF;
		config.tabWidth = 4;
		if (someLineHasIndent) {
			config.useTabs = someLineHasIndent[0] === '\t';
			if (!config.useTabs) {
				config.tabWidth = someLineHasIndent.length;
			}
		} else {
			config.useTabs = true;
		}

		this.detectLastNewLine(text);
	}

	private detectLastNewLine(text: string) {
		const lastClose = text.lastIndexOf('}');
		this.current.lastNewLine = lastClose !== text.length - 1;
	}
}
