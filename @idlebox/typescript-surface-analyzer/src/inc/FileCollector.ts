import { normalize } from 'path';
import { getSourceRoot, IExtendParsedCommandLine } from '@idlebox/tsconfig-loader';
import ts from 'typescript';
import { ILogger, showFile } from './logger';
import { IResolveResult, MapResolver } from './MapResolver';
import { ExportKind, ITypescriptFile, TokenCollector } from './TokenCollector';
import { findingBindingType, idToString, isDefaultExport, isExported, isTagInternal } from './tsapi.helpers';

export class FileCollector {
	private readonly sourceRoot: string;
	private readonly sources = new Map<ts.SourceFile, TokenCollector>();
	private readonly resolver: MapResolver;

	constructor(options: IExtendParsedCommandLine['options'], private readonly logger: ILogger) {
		this.sourceRoot = getSourceRoot(options);
		this.resolver = new MapResolver(this.sourceRoot, options.paths);
	}

	collect(sourceFiles: ts.SourceFile[]): ITypescriptFile[] {
		this.sources.clear();

		for (const sourceFile of sourceFiles) {
			const collector = new TokenCollector(sourceFile, this.relativeToRoot(sourceFile.fileName), this.logger);
			this.sources.set(sourceFile, collector);
		}

		for (const sourceFile of sourceFiles) {
			const collector = this.sources.get(sourceFile)!;
			this.logger.debug('-> %s <-', collector.relativePath);

			ts.forEachChild(sourceFile, (node: ts.Node) => {
				this.tokenWalk(collector, node, this.logger);
			});
		}

		return [...this.sources.values()];
	}

	private relativeToRoot(abs: string) {
		return normalize(abs)
			.replace(this.sourceRoot, '')
			.replace(/^[\/\\]/g, '');
	}

	private tokenWalk(collect: TokenCollector, node: ts.Node, logger: ILogger) {
		if (node.kind === ts.SyntaxKind.EndOfFileToken) {
			return;
		}
		if (!isTagInternal(node)) {
			logger.debug(' * tsdoc @internal node: %s', ts.SyntaxKind[node.kind]);
			return;
		}

		if (ts.isExportDeclaration(node)) {
			// logger.debug(' * found ExportDeclaration');
			let reference: IResolveResult;
			try {
				const path = (0 || eval)(node.moduleSpecifier!.getText());
				reference = this.resolver.require(collect.absolutePath, path);
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
				if (ts.isNamespaceExport(node.exportClause)) {
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

		if (ts.isExportAssignment(node)) {
			// export default VALUE
			// logger.debug(' * found ExportAssignment');
			const id: ts.Identifier | undefined = ts.isIdentifier(node.expression) ? node.expression : undefined;

			collect.setDefault(id, node, ExportKind.Variable);

			return;
		}

		if (!isExported(node)) {
			// logger.debug(' * not exported: %s', ts.SyntaxKind[node.kind]);
			return;
		}

		if (ts.isModuleDeclaration(node)) {
			// logger.debug(' * found ModuleDeclaration');
			// export namespace|module
			if (ts.isStringLiteral(node.name)) {
				this.logger.error(
					'only .d.ts can use <export namespace|module "name">, and analyzer do not support this.',
					showFile(node)
				);
			} else {
				collect.add(node.name, node, ExportKind.Variable);
			}

			return;
		}

		let _isEnumDeclaration: boolean = false,
			_isClassDeclaration: boolean = false,
			_isInterfaceDeclaration: boolean = false,
			_isFunctionDeclaration: boolean = false,
			_isTypeAliasDeclaration: boolean = false;
		if (
			(_isEnumDeclaration = ts.isEnumDeclaration(node)) || // export enum XXX { ... }
			(_isClassDeclaration = ts.isClassDeclaration(node)) || // export class XXX {}
			(_isInterfaceDeclaration = ts.isInterfaceDeclaration(node)) || // export interface XXX {}
			(_isFunctionDeclaration = ts.isFunctionDeclaration(node)) || // export function XXX {}
			(_isTypeAliasDeclaration = ts.isTypeAliasDeclaration(node)) // export type x = ...
		) {
			logger.debug(' * found %s', ts.SyntaxKind[node.kind]);

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

			if (isDefaultExport(node)) {
				collect.setDefault(node.name, node, type);
			} else if (node.name) {
				collect.add(node.name, node, type);
			} else {
				console.error(node);
				logger.error('missing name of %s', ts.SyntaxKind[node.kind], showFile(node));
			}
			return;
		}

		if (ts.isVariableStatement(node)) {
			// export const/let/var ...
			for (const { name } of node.declarationList.declarations) {
				for (const id of findingBindingType(name)) {
					if (idToString(id).length === 0) {
						continue;
					}

					logger.debug(' * found variable %s', idToString(id));
					collect.add(id, node, ExportKind.Variable);
				}
			}

			return;
		}

		this.logger.error('Not handled node: %s: %s', ts.SyntaxKind[node.kind], node.getText());
	}
}
