import { relativePath } from '@idlebox/node';
import type { Cheerio, CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';
import type { ImportKind } from 'esbuild';
import { debug, type IDiagnostics } from './tools.js';

export type CheerElement = Cheerio<Element>;

const isRemoteUrl = /^https?:|^file:/;

export enum TagKind {
	script = 0,
	link = 1,
}

export class Tag {
	public readonly field: string;
	public readonly src: string;
	public readonly kind: TagKind;

	constructor(public readonly $elem: CheerElement) {
		this.kind = $elem[0].tagName === 'script' ? TagKind.script : TagKind.link;
		this.field = this.kind === TagKind.link ? 'href' : 'src';
		this.src = $elem.attr(this.field)!;
		this.$elem.attr(`data-${this.field}`, this.src);
		this.unuse();
	}

	importKind(): ImportKind {
		return this.kind === TagKind.link ? 'import-rule' : 'import-statement';
	}

	isValid() {
		return this.src && !isRemoteUrl.test(this.src);
	}

	use(src: string) {
		this.$elem.attr(this.field, src.startsWith('.') ? src : `./${src}`);
	}

	unuse() {
		this.$elem.removeAttr(this.field);
	}

	toString() {
		return this.$elem.toString();
	}
}

interface ILoad {
	readonly id: string;
	readonly filepath: string;
	readonly tag: Tag;
}

export class TagCollection {
	private readonly tags: ILoad[] = [];

	constructor(
		public readonly $html: CheerioAPI,
		private readonly commonRoot: string,
		public readonly htmlSource: string,
	) {}

	get size() {
		return this.tags.length;
	}

	register(filepath: string, tag: Tag) {
		this.tags.push({ id: relativePath(this.commonRoot, filepath), filepath, tag });
	}

	apply(entryFile: string, cssBundle: string | undefined, _res: IDiagnostics) {
		const entryTagHasSet = {
			[TagKind.link]: false,
			[TagKind.script]: false,
		};
		const sources = {
			[TagKind.link]: cssBundle,
			[TagKind.script]: entryFile,
		};
		for (const item of this.tags) {
			debug('TAG:', item.tag.toString());
			const src = sources[item.tag.kind];

			if (entryTagHasSet[item.tag.kind] || !src) {
				debug('   -> not use');
				item.tag.unuse();
				continue;
			}
			entryTagHasSet[item.tag.kind] = true;

			debug('   -> use main %s: %s', TagKind[item.tag.kind], src);
			item.tag.use(src);
		}

		if (cssBundle && !entryTagHasSet[TagKind.link]) {
			debug('found in-direct imported css, insert one <link/> tag into <head/>');
			this.$html('head').append(`<link rel="stylesheet" href="${cssBundle}">`);
		}
	}

	createDummyScript() {
		let contents = '';
		debug('\x1b[38;5;14mSTART\x1b[0m [%s]', this.htmlSource);
		for (const load of this.tags) {
			debug('  -> %s - %s', TagKind[load.tag.kind], load.filepath);

			contents += `import ${JSON.stringify(load.filepath)}; /* original: ${load.tag.src} */ \n`;
		}
		debug('\x1b[2m%s\x1b[0m', contents.trim());
		debug('\x1b[38;5;14mEND\x1b[0m [%s]', this.htmlSource);
		return contents;
	}
}
