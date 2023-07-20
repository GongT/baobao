import { readFile as readFileAsync } from 'fs';
import { promisify } from 'util';
import { format, Options, resolveConfig } from 'prettier';
import { IFileFormatConfig } from '../';
import { pathExists } from './filesystem.js';

const readFile = promisify(readFileAsync);

enum LineFeed {
	CRLF = 'crlf',
	LF = 'lf',
}

type PassedFormats = 'trailingComma' | 'parser' | 'filepath' | 'quoteProps';

export interface IInternalFormat extends IFileFormatConfig, Pick<Options, PassedFormats> {}

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

export class PrettyFormat {
	constructor(private current: IInternalFormat = { ...defaultFormat }) {}

	setFormat(format: Partial<IFileFormatConfig>) {
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

	/** @deprecated */
	learnFromFileAsync(file: string, content?: string) {
		return this.learnFromFile(file, content);
	}

	async learnFromFile(file: string, content?: string) {
		const f = await resolveConfig(file, { editorconfig: true });
		if (f) {
			this.setFormat({ ...f, lastNewLine: true });
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

	toJSON(): IFileFormatConfig {
		return this.current;
	}
}
