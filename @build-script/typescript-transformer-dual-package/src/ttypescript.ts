import { basename, dirname } from 'path';
import { ReplacementSet, TypescriptTransformPlugin } from '@build-script/typescript-transformer-common';
import ts from 'typescript';
import { appendCallback } from './appender';
import { ImportMetaReplacer } from './replace/importMetaReplacer';
import { ImportExportSpecifierReplacer } from './replace/importSpecifier';

export class ShadowTranform extends TypescriptTransformPlugin<{ extension: string }> {
	private declare shadowProgram: ts.Program;
	private declare replacement1: ReplacementSet;
	private declare replacement2: ReplacementSet;

	constructor(extension: string, parent: TypescriptTransformPlugin) {
		super();

		(this.logger?.debug ?? console.log)('create shadow transform:', extension);

		this.pluginOptions = { extension, ...parent.pluginOptions };

		this.shadowProgram = parent.forkProgram({
			declaration: false,
			declarationMap: false,
			module: extension === '.cjs' ? ts.ModuleKind.CommonJS : ts.ModuleKind.ESNext,
		});

		this.writeFile = this.writeFile.bind(this);
	}

	protected override configure(context: ts.TransformationContext, _options: ts.CompilerOptions) {
		this.replacement1 = new ReplacementSet(context, this.logger);
		this.replacement2 = new ReplacementSet(context, this.logger);

		if (this.pluginOptions.extension === '.cjs') {
			this.replacement2.push(new ImportMetaReplacer(ImportMetaReplacer.UrlToFilename));
			this.registerMutation(this.replacement2.syntaxKinds, this.replacement2.execute);
		} else {
			// replace import from "commonjs"?
		}

		this.replacement1.push(
			new ImportExportSpecifierReplacer(appendCallback(this.pluginOptions.extension, this.resolver, this.logger))
		);
	}

	protected transformToplevelNodes(node: ts.Node): ts.Node | ts.Node[] | undefined {
		return this.replacement1.execute(node);
	}

	private writeFile(
		fileName: string,
		text: string,
		writeByteOrderMark: boolean,
		onError?: (message: string) => void,
		_sourceFiles?: readonly ts.SourceFile[],
		_data?: ts.WriteFileCallbackData
	) {
		const dir = dirname(fileName);
		const base = basename(fileName);
		const newBase = base.replace(/\.jsx?(\.map$|$)/i, this.pluginOptions.extension + '$1');
		this.logger.debug('   * write: %s/{%s => %s}', dir, base, newBase);

		if (newBase.endsWith('.map')) {
			const mapData = JSON.parse(text);
			if (mapData.file) {
				mapData.file = mapData.file.replace(/\.js(x?)$/i, this.pluginOptions.extension + '$1');
			} else {
				(onError || this.logger.error)(
					`[dual-package] warning: sourcemap file ${dir}/${newBase} did not contains file.`
				);
			}
			text = JSON.stringify(mapData, null, 4);
		} else {
			if (/\.jsx?$/.test(base)) {
				text = text.trimEnd();
				const lastLineAt = text.lastIndexOf('\n');
				let lastLine = text.slice(lastLineAt + 1);
				const re = /\.js(x?\.map)$/;
				if (re.test(lastLine)) {
					lastLine = lastLine.replace(re, this.pluginOptions.extension + '$1');
					text = text.slice(0, lastLineAt) + '\n' + lastLine + '\n';
				} else {
					this.logger.debug('inline-sourcemap currently not support');
				}
			}
		}

		return ts.sys.writeFile(`${dir}/${newBase}`, text, writeByteOrderMark);
	}

	emit(file: ts.SourceFile) {
		try {
			this.logger.debug('re-emit file: %s', file.fileName);
			this.shadowProgram.emit(this.shadowProgram.getSourceFile(file.fileName), this.writeFile, undefined, false, {
				before: [this.plugin(this.shadowProgram, this.pluginOptions)],
			});
		} catch (e: any) {
			this.logger.error('failed re-emit shadow program: %s', e.stack || e.message);
			throw e;
		}
	}
}
