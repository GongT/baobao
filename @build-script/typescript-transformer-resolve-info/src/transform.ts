import * as ts from 'typescript';
import { dirname } from 'path';
import {
	collectImportInfo,
	createDependencies,
	createProgramPlugin,
	getAllImports,
	getDebug,
	getImportedName,
	IExtraOpts,
	isImportFromNodeModules,
	isImportNodeBuiltins,
	resolveTypescriptModule,
} from '@build-script/typescript-transformer-common';
import { writeFileIfChangeSync } from '@idlebox/node';
import { mkdirpSync } from 'fs-extra';
import { IImportInfoFile } from './info';
import { resolveProjectFile } from '../../typescript-transformer-common/src/resolvers/resolve.tsprogram';

export interface IOptions {
	verbose?: boolean;
	packageJsonPath?: string;
}

/** @external */
export const pluginFunction = createProgramPlugin(function plugin(
	program: ts.Program,
	{ verbose }: IOptions = {},
	{ rootDir, outDir, packageJsonPath }: IExtraOpts
) {
	const debug = getDebug(verbose || false);
	debug('new ts.Program... %s files', program.getSourceFiles().length);

	const wrapImportFileName = function (f: string) {
		return f.replace(rootDir, outDir).replace(/\.tsx?$/, '.js') + '.importinfo';
	};

	debug('load package.json: %s', packageJsonPath);
	const dependencies = createDependencies(packageJsonPath);
	debug('    dependencies count: %s', Object.keys(dependencies).length);

	const typeChecker = program.getTypeChecker();

	return function transformer(transformationContext: ts.TransformationContext) {
		transformationContext.enableEmitNotification(ts.SyntaxKind.SourceFile);

		return (sourceFile: ts.SourceFile) => {
			const { fileName } = sourceFile;
			const importInfoFile: IImportInfoFile = { externals: [], internals: [], errors: [] };

			debug('[trans] visit \x1B[2m%s\x1B[0m', fileName);

			const imports = getAllImports(sourceFile);
			for (const importStat of imports) {
				const importId = getImportedName(importStat);
				if (isImportNodeBuiltins(importId)) {
					continue;
				}

				if (isImportFromNodeModules(importStat)) {
					const info = resolveTypescriptModule(importStat, packageJsonPath);
					if (info.type === 'missing') {
						importInfoFile.errors!.push(info);
					} else {
						const identifiers = collectImportInfo(sourceFile, [importStat], typeChecker);
						importInfoFile.externals.push({
							...info,
							identifiers: identifiers.values,
							types: identifiers.types,
						});
					}
				} else {
					const info = resolveProjectFile(importStat, program);
					if (info.type === 'missing') {
						importInfoFile.errors!.push(info);
					} else {
						const identifiers = collectImportInfo(sourceFile, [importStat], typeChecker);
						importInfoFile.internals.push({
							...info,
							identifiers: identifiers.values,
							types: identifiers.types,
						});
					}
				}
			}

			debug('[trans] visit complete');

			transformationContext.onEmitNode(ts.EmitHint.SourceFile, sourceFile, () => {
				const distFile = wrapImportFileName(fileName);
				// console.log('---------------', distFile, importInfoFile);
				mkdirpSync(dirname(distFile));
				if (importInfoFile.errors!.length === 0) {
					delete importInfoFile.errors;
				}
				writeFileIfChangeSync(distFile, JSON.stringify(importInfoFile, null, 4));
			});

			return sourceFile;
		};
	};
});

/*

			function visitNode(node: Node): VisitResult<Node> {
				try {
					if (isImport(node)) {
						const importId = getImportedName(node);
						if (isImportNodeBuiltins(importId)) {
							return;
						}
						const identifiers = collectImportInfo(node, typeChecker);
						debug(' * %s', node.getText().split('\n').join(' '));
						if (isImportFromNodeModules(importId)) {
							const { packageName } = splitPackageName(importId);
							if (identifiers.values.length > 0 && !dependencies[packageName]) {
								importInfoFile.errors!.push({
									...missing(importId),
									identifiers: identifiers.values,
								});
								error(createDiagnosticMissingImport(node));
							} else {
								const info = resolveTypescriptModule(node, packageJsonPath);
								if (info.type === 'missing') {
									error(createDiagnosticMissingImport(node));
									importInfoFile.errors!.push(info);
								} else {
									importInfoFile.externals.push({
										...info,
										identifiers: identifiers.values,
									});
								}
							}
						} else {
							const info = resolveProjectFile(node, ts.Program);
							if (info.type === 'missing') {
								error(createDiagnosticMissingImport(node));
								importInfoFile.errors!.push(info);
							} else {
								importInfoFile.internals.push({
									...info,
									identifiers: identifiers.values,
								});
							}
						}
					}
					return node;
				} catch (e) {
					e.message += '\n  current node: [' + node.getText().split('\n', 1)[0] + '] infile ' + fileName;
					throw e;
				}
			}
			*/
