export interface IImportInfoModule extends IImportInfoResolveSuccess {
	type: 'module';
}
export interface IImportInfoCommonjs extends IImportInfoResolveSuccess {
	type: 'commonjs';
}
export interface IImportInfoTypeSource extends IImportInfoResolveSuccess {
	type: 'typescript';
}

export interface IImportInfoResolveSuccess extends IImportInfoBase {
	identifiers: string[];
	nodeResolve: string;
	fsPath: string;
}

export interface IImportInfoMissing extends IImportInfoBase {
	type: 'missing';
}

interface IImportInfoBase {
	types?: string[];
	identifiers?: string[];
	specifier: string;
}

export type IImportInfo = IImportInfoModule | IImportInfoCommonjs;

export function missing(specifier: string): IImportInfoMissing {
	return {
		type: 'missing',
		specifier,
	};
}
