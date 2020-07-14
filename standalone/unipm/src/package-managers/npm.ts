import { PackageManagerType } from './../common/packageManager';
import { PackageManager } from '../common/packageManager';

/** @internal */
export class Npm extends PackageManager {
	readonly type = PackageManagerType.NPM;
	readonly friendlyName: string = 'npm';
	readonly cliName: string = 'npm';
	readonly installCommand: string = 'install';
	readonly packageName: string = 'npm';
	readonly uninstallCommand: string = 'uninstall';
	readonly installDevFlag: string = '--save-dev';
	readonly syncCommand: string = 'i';

	_detect(): Promise<boolean> {
		return this._detectFile('package-lock.json');
	}
}
