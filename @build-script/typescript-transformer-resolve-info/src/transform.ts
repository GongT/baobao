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
	resolveProjectFile,
} from '@build-script/typescript-transformer-common';
import { writeFileIfChangeSync } from '@idlebox/node';
import { mkdirpSync } from 'fs-extra';
import { IImportInfoFile } from './info';

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
			const importInfoFile: IImportInfoFile = { imports: [], errors: [] };

			debug('[trans] visit \x1B[2m%s\x1B[0m', fileName);

			const imports = getAllImports(sourceFile);
			const importsWithoutBuiltin = imports.filter((importStat) => {
				const importId = getImportedName(importStat);
				return !isImportNodeBuiltins(importId);
			});
			const importInfoResult = collectImportInfo(sourceFile, importsWithoutBuiltin, typeChecker);
			for (const importStat of imports) {
				const importId = getImportedName(importStat);
				if (isImportNodeBuiltins(importId)) {
					continue;
				}

				const info = isImportFromNodeModules(importStat)
					? resolveTypescriptModule(importStat, packageJsonPath)
					: resolveProjectFile(importStat, program);
				if (info.type === 'missing') {
					importInfoFile.errors!.push(info);
					continue;
				}

				const importInfo = importInfoResult.get(importStat);
				importInfoFile.imports.push({
					...info,
					values: importInfo?.values ?? [],
					types: importInfo?.types ?? [],
				});
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
