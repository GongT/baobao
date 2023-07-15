import type TypeScriptApi from 'typescript';

import { ModuleResolver, WantModuleKind } from '../library/ModuleResolver';
import { NodeReplacer } from '../library/NodeReplacer';
import { isImportExportFrom, ValidImportOrExportFromDeclaration } from '../library/util';

export class ImportCommonJS extends NodeReplacer<ValidImportOrExportFromDeclaration, TypeScriptApi.Node[]> {
	public get kinds() {
		const { ts } = this.context;
		return [ts.SyntaxKind.ImportDeclaration, ts.SyntaxKind.ExportDeclaration];
	}

	private readonly cache;

	constructor(
		protected readonly resolver: ModuleResolver,
		fileDetectCache = new Map<string, boolean>()
	) {
		super();

		this.cache = fileDetectCache;
	}

	override _check(node: TypeScriptApi.Node): node is ValidImportOrExportFromDeclaration {
		const { ts, logger } = this.context;

		// logger.debug('[replacer/import]', TypeScriptApi.SyntaxKind[node.kind], node.getText());
		if (!isImportExportFrom(ts, node)) {
			return false;
		}
		if (ts.isExportDeclaration(node)) {
			logger.terminal.writeDebugLine('            - isExportDeclaration');
			if (node.isTypeOnly || !node.exportClause || !ts.isNamedExports(node.exportClause)) {
				logger.terminal.writeDebugLine('                should skip');
				return false;
			}
		} else {
			logger.terminal.writeDebugLine('            - !isExportDeclaration');
			if (
				!node.importClause ||
				node.importClause.isTypeOnly ||
				!node.importClause.namedBindings ||
				!ts.isNamedImports(node.importClause.namedBindings)
			) {
				logger.terminal.writeDebugLine('                should skip');
				return false;
			}
		}

		const self = node.getSourceFile().fileName;
		const id = node.moduleSpecifier.text;

		const cid = self + '?' + id;
		if (this.cache.has(cid)) {
			return this.cache.get(cid)!;
		}

		const r = this.detectShouldReplace(self, id);
		this.cache.set(cid, r);
		return r;
	}

	private detectShouldReplace(self: string, id: string) {
		const { logger } = this.context;

		const result = this.resolver.resolve(self, id, WantModuleKind.ESM);
		if (!result.success) {
			throw new Error(`failed resolve module "${id}" from "${self}"`);
		}

		if (!result.isNodeModules) {
			logger.terminal.writeDebugLine('                skip node_modules');
			return false;
		}

		if (result.extension === '.mjs' || result.extension === '.ts') {
			logger.terminal.writeDebugLine(`                importing ts or mjs: ${id}`);
			return false;
		}

		const pkgJson = result.readPackageJson();
		const isTypeModule = pkgJson.type?.toLowerCase?.() === 'module';
		if (isTypeModule) {
			logger.terminal.writeDebugLine(`                assume esnext module: ${id} (package.json type is module)`);
			return false;
		}

		logger.terminal.writeDebugLine(`                importing commonjs module: ${id}`);
		return true;
	}

	override _replace(node: ValidImportOrExportFromDeclaration): TypeScriptApi.Node[] {
		const {
			ts,
			logger,
			context: { factory },
		} = this.context;

		const uniqueName =
			'_' + node.moduleSpecifier.text.replace(/^@/, '').replace(/[/\.-]/g, '_') + '_' + node.getStart();
		logger.terminal.writeVerboseLine(`modify import to {default} with id: ${uniqueName}`);
		if (ts.isExportDeclaration(node)) {
			const uid = factory.createIdentifier(uniqueName);

			const elements = (node.exportClause! as TypeScriptApi.NamedExports).elements;
			const list: TypeScriptApi.VariableDeclaration[] = elements.map((item) => {
				return factory.createVariableDeclaration(
					item.name,
					undefined,
					undefined,
					factory.createPropertyAccessExpression(uid, item.propertyName || item.name)
				);
			});

			return [
				factory.createImportDeclaration(
					undefined,
					factory.createImportClause(false, uid, undefined),
					node.moduleSpecifier,
					undefined
				),
				factory.createVariableStatement(
					[factory.createModifier(ts.SyntaxKind.ExportKeyword)],
					factory.createVariableDeclarationList(list, ts.NodeFlags.Const)
				),
			];
		} else {
			const nameToUse = node.importClause?.name?.text ?? uniqueName;
			const uid = factory.createIdentifier(nameToUse);
			if (node.importClause) ts.setOriginalNode(uid, node.importClause.name);

			return [
				factory.createImportDeclaration(
					node.modifiers,
					factory.createImportClause(false, uid, undefined),
					node.moduleSpecifier,
					node.assertClause
				),
				factory.createVariableStatement(
					undefined,
					factory.createVariableDeclarationList(
						[
							factory.createVariableDeclaration(
								factory.createObjectBindingPattern(
									(node.importClause!.namedBindings! as TypeScriptApi.NamedImports).elements.map(
										(node) => {
											return factory.createBindingElement(
												undefined,
												node.propertyName,
												node.name.text,
												undefined
											);
										}
									)
								),
								undefined,
								undefined,
								uid
							),
						],
						ts.NodeFlags.Const
					)
				),
			];
		}
	}
}
