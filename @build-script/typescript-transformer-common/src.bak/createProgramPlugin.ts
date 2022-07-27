import { findUpUntilSync } from '@idlebox/node';
import { Program, SourceFile, TransformationContext } from 'typescript';

export interface ISourcefileFunction {
	(sourceFile: SourceFile): SourceFile;
}

export interface IContextFunction {
	(transformationContext: TransformationContext): ISourcefileFunction;
}

export interface IExtraOpts {
	rootDir: string;
	outDir: string;
	packageJsonPath: string;
}

export interface IPluginFunction {
	(program: Program, pluginOptions: any, extraOptions: IExtraOpts): IContextFunction;
}
export function createProgramPlugin(plugin: IPluginFunction): IPluginFunction {
	return (program: Program, pluginOptions: any = {}) => {
		const options = program.getCompilerOptions();
		const rootDir = pluginOptions.rootDir || options.rootDir;
		const outDir = pluginOptions.outDir || options.outDir;
		if (!rootDir || !outDir) {
			throw new Error('the Program did not provide rootDir and/or outDiris. please modify your tsconfig.json.');
		}

		let packageJsonPath = pluginOptions.packageJsonPath;
		if (!packageJsonPath) {
			const p = findUpUntilSync(rootDir, 'package.json');
			if (!p) {
				throw new Error(
					'Failed to find a package.json from ' + rootDir + '. you can set packageJsonPath in plugin options.'
				);
			}
			packageJsonPath = p;
		}

		return plugin(program, pluginOptions, {
			outDir,
			rootDir,
			packageJsonPath,
		});
	};
}
