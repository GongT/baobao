import { PackageManager, type IUploadResult } from './driver.abstract.js';

export class NPM extends PackageManager {
	override binary = 'npm';

	override async _pack(_saveAs: string, _packagePath: string): Promise<string> {
		throw new Error('Method not implemented.');
	}

	override async _uploadTarball(_pack: string, _cwd: string): Promise<IUploadResult> {
		throw new Error('Method not implemented.');
	}
}
