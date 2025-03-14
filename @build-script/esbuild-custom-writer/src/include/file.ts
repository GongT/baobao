export interface IOnEmitFileCallback {
	/**
	 * 文件回调
	 * @param file 文件数据
	 * @param parent 入口信息
	 * @param prev 上次这个文件的数据（如有）
	 */
	(file: IFile, parent: IEntry, prev?: Readonly<IFile>): PromiseLike<Readonly<IFile> | false>;
}

export interface IEntry {
	readonly id: string;
	readonly path: string;
	readonly relative: string;
}

export interface IFile {
	readonly relative: string;
	path: string;
	contents: Uint8Array;
	hash: string;
}
