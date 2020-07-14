import { PackageManager, PackageManagerType } from '../common/packageManager';

/** @internal */
export class Yarn extends PackageManager {
	readonly type = PackageManagerType.YARN;
	readonly friendlyName: string = 'yarn';
	readonly cliName: string = 'yarn';
	readonly installCommand: string = 'add';
	readonly packageName: string = 'yarn';
	readonly uninstallCommand: string = 'remove';
	readonly installDevFlag: string = '--dev';
	readonly syncCommand: string = 'install';
	readonly showCommand: string = 'view';

	_detect(): Promise<boolean> {
		return this._detectFile('yarn.lock');
	}
}
