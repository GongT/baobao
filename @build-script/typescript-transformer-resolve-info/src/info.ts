import { IImportInfo, IImportInfoMissing, IImportInfoProjectSource } from '@build-script/typescript-transformer-common';

interface ImportsInfo {
	types: string[];
	values: string[];
}

export type WithInfo<T> = T & ImportsInfo;
export type ImportWithInfo = WithInfo<IImportInfo | IImportInfoProjectSource>;

export interface IImportInfoFile {
	imports: ImportWithInfo[];
	errors?: IImportInfoMissing[];
}
