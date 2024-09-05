import type TypeScriptApi from 'typescript';
import { DeepPartial, DeepReadonly } from '../../../misc/functions';
import { ITypeScriptState } from '../../../misc/pluginBase';
import { IPluginInit } from './transform-load';

export interface IMyPluginConfig {
	readonly transform: string;
	readonly after?: boolean;
	readonly afterDeclarations?: boolean;
	readonly importName?: string;
	readonly options?: Record<string, string | number | boolean>;
}

interface IOptionalOptions {
	compilerOptions?: TypeScriptApi.CompilerOptions & {
		module?: string;
		plugins?: IMyPluginConfig[];
	};
}
interface IFilledOptions {
	extension: string;
	fast: boolean;
	warningAsError: boolean;
	skipNodeModules: boolean;
	errorLevels: {
		error: number[];
		warning: number[];
		notice: number[];
	};
}

export interface IMyOptionsInput extends IOptionalOptions, DeepPartial<IFilledOptions> {}
export interface IMyOptions extends IOptionalOptions, DeepReadonly<IFilledOptions> {}

export const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');

export interface IProgramState extends ITypeScriptState {
	createTransformers: IPluginInit;
	readonly options: IMyOptionsInput;
}
