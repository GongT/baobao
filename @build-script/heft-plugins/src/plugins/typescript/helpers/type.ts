import type TypeScriptApi from 'typescript';
import { ILoadConfigOverride } from '../../../misc/loadTsConfigJson';

export interface IMyPluginConfig {
	readonly transform: string;
	readonly after?: boolean;
	readonly afterDeclarations?: boolean;
	readonly importName?: string;
	readonly options?: Record<string, string | number | boolean>;
}

export interface IMyOptions extends ILoadConfigOverride {
	extension?: string;
	fast?: boolean;

	compilerOptions?: TypeScriptApi.CompilerOptions & {
		module?: string;
		plugins?: IMyPluginConfig[];
	};
}

export const isModuleResolutionError = (ex: any) =>
	typeof ex === 'object' &&
	!!ex &&
	'code' in ex &&
	(ex.code === 'MODULE_NOT_FOUND' || ex.code === 'ERR_MODULE_NOT_FOUND');
