import { getSourceRoot } from '@idlebox/tsconfig-loader';
import { relative } from 'node:path';
import type TypeScriptApi from 'typescript';
import { type ILogger, showFile } from './logger.js';
import { type IResolveResult, MapResolver } from './MapResolver.js';
import { ExportKind, type ITypescriptFile, TokenCollector } from './TokenCollector.js';
import type { ApiHost } from './tsapi.helpers.js';

export class FileCollector {
	private readonly sourceRoot: string;
	private readonly sources = new Map<TypeScriptApi.SourceFile, TokenCollector>();
	private readonly resolver: MapResolver;
	readonly ts: typeof TypeScriptApi;
	public stripTags: readonly string[] = ['internal'];

	constructor(
		private readonly api: ApiHost,
		options: TypeScriptApi.CompilerOptions,
		private readonly logger: ILogger
	) {
		this.ts = api.ts;
		this.sourceRoot = getSourceRoot(options);
		this.resolver = new MapResolver(this.sourceRoot, options.paths);
	}

	collect(sourceFiles: TypeScriptApi.SourceFile[]): ITypescriptFile[] {
		this.sources.clear();

		for (const sourceFile of sourceFiles) {
			const collector = new TokenCollector(sourceFile, this.relativeToRoot(sourceFile.fileName), this.logger);
			this.sources.set(sourceFile, collector);
		}

		for (const sourceFile of sourceFiles) {
			const collector = this.sources.get(sourceFile)!;
			this.logger.debug('-> %s <-', collector.relativePath);

			this.ts.forEachChild(sourceFile, (node: TypeScriptApi.Node) => {
				this.tokenWalk(collector, node, this.logger);
			});
		}

		return [...this.sources.values()];
	}

	private relativeToRoot(abs: string) {
		return relative(this.sourceRoot, abs).replace(/^\/+|^[a-z]:[/\\]+/gi, '');
	}

	private tokenWalk(collect: TokenCollector, node: TypeScriptApi.Node, logger: ILogger) {
		if (node.kind === this.ts.SyntaxKind.EndOfFileToken) {
			return;
		}

		const tagMatched = this.api.isTagMatch(node, this.stripTags);
		if (tagMatched) {
			logger.verbose(' * skip node by tsdoc @%s: %s', tagMatched, this.ts.SyntaxKind[node.kind]);
			return;
		}

		if (this.ts.isExportDeclaration(node)) {
			logger.verbose(' * found ExportDeclaration');
			let reference: IResolveResult;
			try {
				if (node.moduleSpecifier) {
					// export {a, b, c} from 'xxxx';
					const path = (0 || eval)(node.moduleSpecifier.getText()); // TODO
					const ref = this.resolver.resolve(collect.absolutePath, path);

					if (ref) {
						reference = ref;
					} else {
						reference = { type: 'dependency', name: path };
					}
				} else {
					// export {a, b, c};
					reference = this.resolver.convert(collect.absolutePath);
				}
			} catch (e: any) {
				this.logger.error(
					'===================\n%s\nLINE: %s\n%s\n===================',
					e,
					node.getText(),
					showFile(node)
				);
				return;
			}

			if (node.exportClause) {
				if (this.ts.isNamespaceExport(node.exportClause)) {
					// export * as a from 'X';
					collect.addRef(node.exportClause.name, node, reference, ExportKind.Variable);
				} else {
					// export {a as b, c} from 'X';
					for (const item of node.exportClause.elements) {
						collect.addRef(item.name, node, { ...reference, id: item.propertyName }, ExportKind.Unknown);
					}
				}
			} else {
				// export * from X;

				try {
					collect.addNamespaceRef(reference, node);
				} catch (e: any) {
					this.logger.error(e.message, showFile(node));
				}
			}

			return;
		}

		if (this.ts.isExportAssignment(node)) {
			// export default VALUE
			logger.debug(' * found ExportAssignment');
			const id: TypeScriptApi.Identifier | undefined = this.ts.isIdentifier(node.expression)
				? node.expression
				: undefined;

			collect.setDefault(id, node, ExportKind.Variable);

			return;
		}

		if (!this.api.isExported(node)) {
			// logger.debug(' * not exported: %s', this.ts.SyntaxKind[node.kind]);
			return;
		}

		if (this.ts.isModuleDeclaration(node)) {
			logger.debug(' * found ModuleDeclaration');
			// export namespace|module
			if (this.ts.isStringLiteral(node.name)) {
				this.logger.error(
					'only .d.ts can use <export namespace|module "name">, and analyzer do not support this.',
					showFile(node)
				);
			} else {
				collect.add(node.name, node, ExportKind.Variable);
			}

			return;
		}

		let _isEnumDeclaration = false;
		let _isClassDeclaration = false;
		let _isInterfaceDeclaration = false;
		let _isFunctionDeclaration = false;
		let _isTypeAliasDeclaration = false;
		if (
			(_isEnumDeclaration = this.ts.isEnumDeclaration(node)) || // export enum XXX { ... }
			(_isClassDeclaration = this.ts.isClassDeclaration(node)) || // export class XXX {}
			(_isInterfaceDeclaration = this.ts.isInterfaceDeclaration(node)) || // export interface XXX {}
			(_isFunctionDeclaration = this.ts.isFunctionDeclaration(node)) || // export function XXX {}
			(_isTypeAliasDeclaration = this.ts.isTypeAliasDeclaration(node)) // export type x = ...
		) {
			logger.verbose(' * found %s', this.ts.SyntaxKind[node.kind]);

			let type = ExportKind.Unknown;

			if (_isEnumDeclaration) {
				type = ExportKind.Variable;
			} else if (_isClassDeclaration) {
				type = ExportKind.Class;
			} else if (_isInterfaceDeclaration || _isTypeAliasDeclaration) {
				type = ExportKind.Type;
			} else if (_isFunctionDeclaration) {
				type = ExportKind.Function;
			}

			if (this.api.isDefaultExport(node)) {
				collect.setDefault(node.name, node, type);
			} else if (node.name) {
				collect.add(node.name, node, type);
			} else {
				console.error(node);
				logger.error('missing name of %s', this.ts.SyntaxKind[node.kind], showFile(node));
			}
			return;
		}

		if (this.ts.isVariableStatement(node)) {
			// export const/let/var ...
			for (const { name } of node.declarationList.declarations) {
				for (const id of this.api.findingBindingType(name)) {
					if (this.api.idToString(id).length === 0) {
						continue;
					}

					logger.verbose(' * found variable %s', this.api.idToString(id));
					collect.add(id, node, ExportKind.Variable);
				}
			}

			return;
		}

		this.logger.error('Not handled node: %s: %s', this.ts.SyntaxKind[node.kind], node.getText());
	}
}
