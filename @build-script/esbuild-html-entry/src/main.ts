import { relativePath } from '@idlebox/node';
import { type CheerioAPI, load as loadHtml } from 'cheerio';
import type esbuild from 'esbuild';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { Tag, TagCollection } from './tag.js';
import { commonParent, debug, type IDiagnostics } from './tools.js';

const PLUGIN_NAME = 'html-creation';
const NAMESPACE = 'esbuild-html-entry';
const isHtml = /.*\.html$/;
// const rExt = /\..+?$/;

interface ICache {
	readonly filepath: string;
	readonly content: CheerioAPI;
	readonly mtime: Date;
	readonly tags: TagCollection;
	result: esbuild.OnLoadResult;
}

export class HtmlEntryPlugin {
	private readonly cache = new Map<string, ICache>();
	private readonly sourceRoot: string;
	private readonly commonParent: string;
	private readonly _resolve: (path: string, options?: esbuild.ResolveOptions) => Promise<esbuild.ResolveResult>;

	constructor(build: esbuild.PluginBuild) {
		debug('[plugin] absWorkingDir:', build.initialOptions.absWorkingDir);

		this.sourceRoot = resolve(build.initialOptions.absWorkingDir ?? process.cwd());
		debug('[plugin] sourceRoot:', this.sourceRoot);

		const cr = resolve(this.sourceRoot, build.initialOptions.outdir ?? '.');
		if (cr.startsWith(this.sourceRoot) || this.sourceRoot.startsWith(cr)) {
		}
		this.commonParent = commonParent(this.sourceRoot, cr);
		debug('[plugin] commonParent:', this.commonParent);

		this._resolve = build.resolve;

		this.onResolve = this.onResolve.bind(this);
		this.onLoad = this.onLoad.bind(this);
		this.onEnd = this.onEnd.bind(this);
	}

	async onEnd(args: esbuild.BuildResult): Promise<esbuild.OnEndResult | null> {
		const res: IDiagnostics = { warnings: [], errors: [] };
		if (!args.metafile) {
			res.warnings.push({ text: 'html file(s) not created due to previous error' });
			return res;
		}
		debug(
			'\x1b[38;5;11m[onEnd]\x1b[0m outputFiles:',
			args.outputFiles?.map((e) => e.path),
		);
		debug('        metafile.outputs:', Object.keys(args.metafile.outputs));

		const entryMap = new Map<ICache, string>();

		for (const [jsBundle, output] of Object.entries(args.metafile.outputs)) {
			if (!output.entryPoint?.startsWith(`${NAMESPACE}:`)) {
				debug('\x1b[2m ✘ %s (entry: %s)\x1b[0m', jsBundle, output.entryPoint);
				continue;
			}
			debug('\x1b[38;5;14m ✔ %s\x1b[0m', jsBundle);

			const sourceFile = output.entryPoint.substring(NAMESPACE.length + 1);
			debug('   * sourceFile:', sourceFile);

			const entry = this.cache.get(sourceFile);
			if (!entry) {
				res.errors.push({ text: 'entry not found', location: { file: sourceFile } });
				continue;
			}
			debug('   * inputs:', Object.keys(output.inputs));

			const outputDir = resolve(this.commonParent, dirname(jsBundle));
			debug('   * outputDir:', outputDir);

			const jsBundleRel = relativePath(outputDir, resolve(this.commonParent, jsBundle));
			debug('   * jsBundle: %s (%s)', jsBundleRel, jsBundle);

			const cssBundleRel = output.cssBundle ? relativePath(outputDir, resolve(this.commonParent, output.cssBundle)) : undefined;
			debug('   * cssBundle: %s (%s)', cssBundleRel, output.cssBundle);

			const outputFile = resolve(outputDir, basename(sourceFile));
			debug('   * outputFile:', outputFile);

			debug('   * tags:', entry.tags.size);

			entryMap.set(entry, outputFile);

			entry.tags.apply(jsBundleRel, cssBundleRel, res);
			// if (!output.inputs[item.relative]) {
			// 	res.errors.push({
			// 		text: `unknown tag source ${item.relative}`,
			// 		location: { file: entryFile, lineText: item.element.toString() },
			// 	});
			// 	continue;
			// }
		}

		/* Emit Html Files  */
		for (const [entry, filename] of entryMap.entries()) {
			const text = entry.content.html();
			await writeFile(filename, text, 'utf-8');
		}

		return res.errors.length || res.warnings.length ? res : null;
	}

	protected findByInput(path: string) {
		for (const entry of this.cache.values()) {
			// if(entry.loads.)
			if (entry.result.pluginData.filepath === path) {
				return entry;
			}
		}
		return null;
	}

	onResolve(args: esbuild.OnResolveArgs): null | esbuild.OnResolveResult {
		if (args.importer) {
			return null;
		}
		const path = resolve(this.sourceRoot, args.path);
		return { namespace: NAMESPACE, path: path, pluginData: { filepath: path }, watchFiles: [path] };
	}

	async onLoad(args: esbuild.OnLoadResult): Promise<esbuild.OnLoadResult> {
		const filepath: string = args.pluginData.filepath;
		const ss = await stat(filepath);
		// TODO: cache

		const text = await readFile(filepath, 'utf-8');

		const diag: IDiagnostics = {
			errors: [],
			warnings: [],
		};

		const ret: esbuild.OnLoadResult = {
			contents: '',
			loader: 'js',
			pluginName: PLUGIN_NAME,
			resolveDir: this.sourceRoot,
		};

		const html = loadHtml(text, {
			baseURI: dirname(filepath),
			onParseError(err) {
				diag.errors.push({
					pluginName: PLUGIN_NAME,
					text: `parse html failed: ${err.code}`,
					location: {
						file: filepath,
						line: err.startLine - 1,
						column: err.startCol - 1,
						length: err.endOffset - err.startOffset,
					},
				});
			},
		});

		const tags = await this.work(html, args, diag);

		ret.contents = tags.createDummyScript();

		this.cache.set(filepath, {
			filepath: filepath,
			content: html,
			mtime: ss.mtime,
			tags: tags,
			result: ret,
		});

		if (diag.errors.length) ret.errors = diag.errors;
		if (diag.warnings.length) ret.warnings = diag.warnings;

		return ret;
	}

	private async tryResolve(kind: esbuild.ImportKind, importer: string, file: string, diag: IDiagnostics) {
		if (!file.startsWith('.')) {
			file = `./${file}`;
		}
		const res = await this._resolve(file, { importer, kind, resolveDir: dirname(importer) });
		diag.errors.push(...res.errors);
		diag.warnings.push(...res.warnings);
		if (res.external || !res.path) return null;

		if (!res.sideEffects) {
			diag.warnings.push({ text: `file ${res.path} has no sideEffects` });
		}

		return res;
	}

	private async work($: CheerioAPI, args: esbuild.OnLoadResult, diag: IDiagnostics) {
		const filepath = args.pluginData.filepath;
		const loads = new TagCollection($, this.commonParent, filepath);
		for (const htmlTag of $('script,link[rel="stylesheet"]')) {
			const tagObject = new Tag($(htmlTag));
			if (!tagObject.isValid()) continue;

			const res = await this.tryResolve(tagObject.importKind(), filepath, tagObject.src, diag);
			if (!res) continue;

			loads.register(res.path, tagObject);
		}
		return loads;
	}
}

export class ESBuildHtmlEntry implements esbuild.Plugin {
	readonly name = PLUGIN_NAME;

	setup(build: esbuild.PluginBuild) {
		if (!build.initialOptions.metafile) {
			throw new Error(`metafile: true is required to ${PLUGIN_NAME}`);
		}

		const plugin = new HtmlEntryPlugin(build);
		build.onResolve({ filter: isHtml }, plugin.onResolve);
		build.onLoad({ filter: isHtml, namespace: NAMESPACE }, plugin.onLoad);
		build.onEnd(plugin.onEnd);
	}
}
