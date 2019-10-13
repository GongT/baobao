import { PackageManager } from '../common/packageManager';

export class Yarn extends PackageManager {
	readonly friendlyName: string = 'yarn';
	readonly cliName: string = 'yarn';
	readonly installCommand: string = 'add';
	readonly packageName: string = 'yarn';
	readonly uninstallCommand: string = 'remove';
	readonly installDevFlag: string = '--dev';
	readonly syncCommand: string = 'install';

	_detect(): Promise<boolean> {
		return this._detectFile('yarn.lock');
	}
}
