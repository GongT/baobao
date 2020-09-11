import {
	IImportInfo,
	IImportInfoMissing,
	IImportInfoResolveSuccess,
} from '@build-script/typescript-transformer-common';

export interface IImportInfoFile {
	externals: IImportInfo[];
	internals: IImportInfoResolveSuccess[];
	errors?: IImportInfoMissing[];
}
