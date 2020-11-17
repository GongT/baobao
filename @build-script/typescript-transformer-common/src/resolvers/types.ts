export const enum ResolveResultType {
	module = 'module',
	commonjs = 'commonjs',
	typescript = 'typescript',
	missing = 'missing',
}

export interface IImportInfoModule extends IImportInfoResolveSuccess {
	type: ResolveResultType.module;
}
export interface IImportInfoCommonjs extends IImportInfoResolveSuccess {
	type: ResolveResultType.commonjs;
}
export interface IImportInfoProjectSource extends IImportInfoResolveSuccess {
	type: ResolveResultType.typescript;
}

export interface IImportInfoResolveSuccess extends IImportInfoBase {
	sourceKind: SourceProjectKind;
	nodeResolve: string;
	fsPath: string;
}

export interface IImportInfoMissing extends IImportInfoBase {
	type: ResolveResultType.missing;
}

export const enum SourceProjectKind {
	internal = 'internal',
	external = 'external',
}

interface IImportInfoBase {
	sourceKind?: SourceProjectKind;
	types?: string[];
	specifier: string;
	type: ResolveResultType;
}

export type IImportInfo = IImportInfoModule | IImportInfoCommonjs;

export function missing(specifier: string): IImportInfoMissing {
	return {
		type: ResolveResultType.missing,
		specifier,
	};
}
