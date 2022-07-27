import {
	EngineKind,
	isEsModule,
	ReplacementSet,
	TypescriptTransformPlugin,
} from '@build-script/typescript-transformer-common';
import ts from 'typescript';
import { appendCallback } from './appender';
import { ImportCommonJS } from './replace/importCommonJS';
import { ImportMetaReplacer } from './replace/importMetaReplacer';
import { ImportExportSpecifierReplacer } from './replace/importSpecifier';
import { ShadowTranform } from './ttypescript';

export type Extension = '.js' | '.mjs' | '.cjs';

export interface IOptions {
	mjs?: Extension | false;
	cjs?: Extension | false;
	compilerOptions?: ts.CompilerOptions;
}

class TypescriptTransformDualPackage extends TypescriptTransformPlugin<IOptions> {
	private declare replacement: ReplacementSet;
	private replaceMjsRequire?: ImportCommonJS;
	private shadowPlugin?: ShadowTranform;

	private reEmitSourceFile(file: ts.SourceFile) {
		if (file.isDeclarationFile) return;
		this.shadowPlugin?.emit(file);
	}

	protected override configure(context: ts.TransformationContext, options: ts.CompilerOptions) {
		delete this.replaceMjsRequire;
		this.replacement = new ReplacementSet(context, this.logger);

		this.registerNotifycation([ts.SyntaxKind.SourceFile], this.reEmitSourceFile);

		const createAppendCallback = (extension: string) => {
			return appendCallback(extension, this.resolver, this.logger);
		};

		if (this.engine === EngineKind.TTypescript) {
			if (options.module === ts.ModuleKind.CommonJS) {
				this.replacement.push(new ImportMetaReplacer(ImportMetaReplacer.UrlToFilename));

				this.shadowPlugin = new ShadowTranform('.mjs', this);
			} else {
				this.replaceMjsRequire = new ImportCommonJS(this.resolver);
				this.shadowPlugin = new ShadowTranform('.cjs', this);
			}
			this.replacement.push(new ImportExportSpecifierReplacer(createAppendCallback('.js')));
			this.registerMutation(this.replacement.syntaxKinds, this.replacement.execute);
		} else {
			if (options.module === ts.ModuleKind.CommonJS) {
				this.replacement.push(new ImportMetaReplacer(ImportMetaReplacer.UrlToFilename));
				this.replacement.push(
					new ImportExportSpecifierReplacer(createAppendCallback(this.pluginOptions.cjs || '.cjs'))
				);
			} else if (isEsModule(options.module)) {
				this.replaceMjsRequire = new ImportCommonJS(this.resolver);
				this.replacement.push(
					new ImportExportSpecifierReplacer(createAppendCallback(this.pluginOptions.mjs || '.js'))
				);
			}
			this.registerMutation(this.replacement.syntaxKinds, this.replacement.execute);
		}
	}

	protected override transformToplevelNodes(node: ts.Node): ts.Node[] | ts.Node {
		// console.log(' - ', ts.SyntaxKind[node.kind]);
		if (!this.replaceMjsRequire) {
			return node;
		}

		if (this.replaceMjsRequire.check(node, this.logger)) {
			return this.replaceMjsRequire.replace(node, this.context, this.logger) || node;
		}
		return node;
	}
}

export default new TypescriptTransformDualPackage().plugin;
