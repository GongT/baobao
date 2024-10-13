import type TypeScriptApi from 'typescript';

/**
 * 单个tranform设置（compilerOptions.plugins的一项）
 */
export interface ITypescriptPluginDefine {
	readonly transform: string;
	readonly after?: boolean;
	readonly afterDeclarations?: boolean;
	readonly importName?: string;
	readonly options?: Record<string, string | number | boolean>;
}

type NewType = TypeScriptApi.CompilerOptions;

/**
 * heft.json 配置内容
 */
export interface IHeftJsonOptions {
	extension: string;
	fast: boolean;
	warningAsError: boolean;
	skipNodeModules: boolean;
	errorLevels: {
		error: number[];
		warning: number[];
		notice: number[];
	};

	compilerOptions: NewType & {
		module?: string;
		plugins?: ITypescriptPluginDefine[];
	};
}

export const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');
