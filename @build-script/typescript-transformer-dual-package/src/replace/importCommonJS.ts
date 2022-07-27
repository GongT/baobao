import {
	IDebug,
	isImportExportFrom,
	ModuleResolver,
	NodeReplacer,
	ValidImportOrExportFromDeclaration,
} from '@build-script/typescript-transformer-common';
import ts from 'typescript';

export class ImportCommonJS extends NodeReplacer<ValidImportOrExportFromDeclaration, ts.Node[]> {
	public readonly kinds = [ts.SyntaxKind.ImportDeclaration, ts.SyntaxKind.ExportDeclaration];

	constructor(private readonly resolver: ModuleResolver) {
		super();
	}

	override check(node: ts.Node, logger: IDebug): node is ValidImportOrExportFromDeclaration {
		if (!isImportExportFrom(node)) {
			return false;
		}
		if (ts.isExportDeclaration(node)) {
			if (node.isTypeOnly || !node.exportClause || !ts.isNamedExports(node.exportClause)) {
				return false;
			}
		} else {
			if (
				!node.importClause ||
				node.importClause.isTypeOnly ||
				!node.importClause.namedBindings ||
				!ts.isNamedImports(node.importClause.namedBindings)
			) {
				return false;
			}
		}

		const self = node.getSourceFile().fileName;
		const id = node.moduleSpecifier.text;
		const out = this.resolver.resolve(self, id);

		if (!out.isNodeModules) {
			return false;
		}

		const pkgJson = out.readPackageJson();
		if (('' + pkgJson.type).toLowerCase() === 'module' || pkgJson.module) {
			logger.debug(`importing esnext module: ${id}`);
			return false;
		}

		logger.debug(`importing commonjs module: ${id}`);
		return true;
	}

	override _replace(
		node: ValidImportOrExportFromDeclaration,
		{ factory }: ts.TransformationContext,
		logger: IDebug
	): ts.Node[] {
		const uniqueName =
			'_' + node.moduleSpecifier.text.replace(/^@/, '').replace(/[/\.-]/g, '_') + '_' + node.getStart();
		logger.debug(`modify import to {default} with id: ${uniqueName}`);
		if (ts.isExportDeclaration(node)) {
			const uid = factory.createIdentifier(uniqueName);

			const elements = (node.exportClause! as ts.NamedExports).elements;
			const list: ts.VariableDeclaration[] = elements.map((item) => {
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
					node.decorators,
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
									(node.importClause!.namedBindings! as ts.NamedImports).elements.map((node) => {
										return factory.createBindingElement(
											undefined,
											node.propertyName,
											node.name.text,
											undefined
										);
									})
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
