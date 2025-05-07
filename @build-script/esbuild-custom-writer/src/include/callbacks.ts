import type { IEntry, IFile, IOnEmitFileCallback } from './file.js';

export class ChainCallbackList {
	private list: IOnEmitFileCallback[] = [];

	add(cb: IOnEmitFileCallback) {
		this.list.push(cb);
	}

	async call(file: IFile, entry?: IEntry, prev?: IFile) {
		for (const cb of this.list) {
			const mfile = await cb(file, entry, prev);
			if (mfile === false) {
				return mfile;
			}

			if (mfile) {
				file = mfile;
			}
		}
		return file;
	}
}
