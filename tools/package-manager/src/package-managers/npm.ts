import { PackageManager } from '../common/packageManager';

export class Npm extends PackageManager {
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
