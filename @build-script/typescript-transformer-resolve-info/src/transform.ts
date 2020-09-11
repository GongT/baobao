import 'source-map-support/register';
import { dirname } from 'path';
import {
	createDependencies,
	createDiagnosticMissingImport,
	createProgramPlugin,
	getDebug,
	getImportedName,
	IExtraOpts,
	isImportExport,
	isImportFromNodeModules,
	isImportNative,
	resolveProjectFile,
	resolveTypescriptModule,
	splitPackageName,
	missing,
} from '@build-script/typescript-transformer-common';
import { writeFileIfChangeSync } from '@idlebox/node';
import { error } from 'fancy-log';
import { mkdirpSync } from 'fs-extra';
import {
	EmitHint,
	Node,
	Program,
	SourceFile,
	SyntaxKind,
	TransformationContext,
	visitEachChild,
	VisitResult,
} from 'typescript';
import { IImportInfoFile } from './info';

export interface IOptions {
	verbose?: boolean;
	packageJsonPath?: string;
}

/** @external */
export default createProgramPlugin(function plugin(
	program: Program,
	{ verbose }: IOptions = {},
	{ rootDir, outDir, packageJsonPath }: IExtraOpts
) {
	const debug = getDebug(verbose || false);
	debug('new program... %s files', program.getSourceFiles().length);

	const wrapImportFileName = function (f: string) {
		return f.replace(rootDir, outDir).replace(/\.tsx?$/, '.js') + '.importinfo';
	};

	debug('load package.json: %s', packageJsonPath);
	const dependencies = createDependencies(packageJsonPath);
	debug('    dependencies count: %s', Object.keys(dependencies).length);

	return function transformer(transformationContext: TransformationContext) {
		transformationContext.enableEmitNotification(SyntaxKind.SourceFile);

		return (sourceFile: SourceFile) => {
			const { fileName } = sourceFile;
			const importInfoFile: IImportInfoFile = { externals: [], internals: [], errors: [] };

			debug('[trans] visit \x1B[2m%s\x1B[0m', fileName);
			const result = visitEachChild(sourceFile, visitNode, transformationContext);
			debug('[trans] visit complete');

			transformationContext.onEmitNode(EmitHint.SourceFile, sourceFile, () => {
				const distFile = wrapImportFileName(fileName);
				// console.log('---------------', distFile, importInfoFile);
				mkdirpSync(dirname(distFile));
				if (importInfoFile.errors!.length === 0) {
					delete importInfoFile.errors;
				}
				writeFileIfChangeSync(distFile, JSON.stringify(importInfoFile, null, 4));
			});

			return result;

			function visitNode(node: Node): VisitResult<Node> {
				try {
					if (isImportExport(node)) {
						const importId = getImportedName(node);
						if (isImportNative(importId)) {
							return;
						}
						debug(' * %s', node.getText().split('\n').join(' '));
						if (isImportFromNodeModules(importId)) {
							const { packageName } = splitPackageName(importId);
							if (!dependencies[packageName]) {
								importInfoFile.errors!.push(missing(importId));
								error(createDiagnosticMissingImport(node));
							} else {
								const info = resolveTypescriptModule(node, packageJsonPath);
								if (info.type === 'missing') {
									error(createDiagnosticMissingImport(node));
									importInfoFile.errors!.push(info);
								} else {
									importInfoFile.externals.push(info);
								}
							}
						} else {
							const info = resolveProjectFile(node, program);
							if (info.type === 'missing') {
								error(createDiagnosticMissingImport(node));
								importInfoFile.errors!.push(info);
							} else {
								importInfoFile.internals.push(info);
							}
						}
					}
					return node;
				} catch (e) {
					e.message += '\n  current node: [' + node.getText().split('\n', 1)[0] + '] infile ' + fileName;
					throw e;
				}
			}
		};
	};
});
