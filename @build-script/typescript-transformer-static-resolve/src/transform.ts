import 'source-map-support/register';
import { relative, resolve } from 'path';
import {
	createDependencies,
	createDiagnosticMissingImport,
	createProgramPlugin,
	getDebug,
	getImportedName,
	IDebug,
	IExtraOpts,
	isImportExport,
	isImportFromNodeModules,
	isImportNative,
	replaceImportExportSpecifier,
	resolveModule,
	resolveTypescriptModule,
	splitPackageName,
	testProjectFile,
	ValidImportOrExportDeclaration,
} from '@build-script/typescript-transformer-common';
import { error } from 'fancy-log';
import { Node, Program, SourceFile, SyntaxKind, TransformationContext, visitEachChild, VisitResult } from 'typescript';

export interface IOptions {
	verbose?: boolean;
	packageJsonPath?: string;
	rootDir?: string;
	outDir?: string;
}

export default createProgramPlugin(function plugin(
	program: Program,
	{ verbose }: IOptions = {},
	{ packageJsonPath }: IExtraOpts
) {
	const debug = getDebug(verbose || false);

	debug('load package.json: %s', packageJsonPath);
	const dependencies = createDependencies(packageJsonPath);
	debug('    dependencies count: %s', Object.keys(dependencies).length);

	return function transformer(transformationContext: TransformationContext) {
		transformationContext.enableEmitNotification(SyntaxKind.SourceFile);

		function visitNode(node: Node): VisitResult<Node> {
			const fileName = node.getSourceFile().fileName;
			if (isImportExport(node)) {
				const importId = getImportedName(node);
				if (isImportNative(importId)) {
					return node;
				}
				debug(' * %s', node.getText(node.getSourceFile()).split('\n').join(' '));
				if (isImportFromNodeModules(importId)) {
					const { packageName } = splitPackageName(importId);
					if (!dependencies[packageName]) {
						error(createDiagnosticMissingImport(node));
					} else {
						const info = resolveTypescriptModule(node, packageJsonPath);
						if (info.type === 'missing') {
							error(createDiagnosticMissingImport(node));
						} else if (info.identifiers.length > 0) {
							debug('   -> replace to %s', info.nodeResolve);
							return replaceImportExportSpecifier(node, info.nodeResolve);
						}
					}
				} else {
					debug('   -> not imported');
					// not node_module
				}

				if (testProjectFile(debug, fileName, node, program)) {
					const importPath = node.moduleSpecifier.text;
					return replaceImportExportSpecifier(node, importPath + '.js');
				}
			}
			return node;
		}

		return (sourceFile: SourceFile) => {
			const { fileName } = sourceFile;
			debug('[trans] visit \x1B[2m%s\x1B[0m', fileName);
			const result = visitEachChild(sourceFile, visitNode, transformationContext);
			debug('[trans] visit complete');
			return result;
		};
	};
});

export function transformExternalModule(
	debug: IDebug,
	node: ValidImportOrExportDeclaration,
	packageJsonPath: string
): ValidImportOrExportDeclaration {
	const importPath = node.moduleSpecifier.text;
	const { packageName, filePath } = splitPackageName(importPath);

	const result = resolveModule(
		'module',
		resolve(packageJsonPath, '../node_modules', packageName, 'package.json'),
		filePath,
		true
	);

	if (result) {
		debug('resolve module result:', result);
		const id = relative(resolve(packageJsonPath, '../node_modules'), result).replace(/^\.\//, '');
		return replaceImportExportSpecifier(node, id);
	} else {
		error(createDiagnosticMissingImport(node));
	}

	return node;
}
