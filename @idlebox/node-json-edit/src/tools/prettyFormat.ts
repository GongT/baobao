import { readFileSync, readFile as readFileAsync } from 'fs';
import { format, Options, Options as PrettierOptions, resolveConfig } from 'prettier';
import { IFileFormatConfig } from '..';
import { pathExistsSync, pathExistsAsync } from './filesystem';
import { promisify } from 'util';

const readFile = promisify(readFileAsync);

enum LineFeed {
	CRLF = 'crlf',
	LF = 'lf',
}

type PassedFormats = 'trailingComma' | 'parser' | 'filepath' | 'quoteProps';

export interface IInternalFormat extends IFileFormatConfig, Pick<PrettierOptions, PassedFormats> {}

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
	embeddedInHtml: false,
};

export class PrettyFormat {
	constructor(private current: IInternalFormat = { ...defaultFormat }) {}

	setFormat(format: Partial<IFileFormatConfig>) {
		Object.assign(this.current, format);
	}

	format(text: string) {
		const result = format(text, {
			...this.current,
			parser: 'json',
			singleQuote: false,
			trailingComma: 'none',
			quoteProps: 'preserve',
		});
		return this.current.lastNewLine ? result : result.trim();
	}

	learnFromFileSync(file: string, content?: string) {
		let f: Options | null = null;
		if (process.env.PRETTIER_CONFIG) {
			f = resolveConfig.sync(process.env.PRETTIER_CONFIG, {
				editorconfig: true,
			});
			if (!f) {
				throw new Error(`[ENV] PRETTIER_CONFIG=${process.env.PRETTIER_CONFIG}: file not found`);
			}
		}
		if (!f) {
			f = resolveConfig.sync(file, { editorconfig: true });
		}
		if (f) {
			this.setFormat({ ...f, lastNewLine: true });
		} else if (pathExistsSync(file)) {
			this.current.filepath = file;
			if (!content) content = readFileSync(file, 'utf-8');
			this.learnFromString(content);
		}
	}

	async learnFromFileAsync(file: string, content?: string) {
		const f = await resolveConfig(file, { editorconfig: true });
		if (f) {
			this.setFormat({ ...f, lastNewLine: true });
		} else if (await pathExistsAsync(file)) {
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
