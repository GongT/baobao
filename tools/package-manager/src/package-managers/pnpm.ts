import { PackageManager } from '../common/packageManager';

export class Pnpm extends PackageManager {
	readonly friendlyName: string = 'pnpm';
	readonly cliName: string = 'pnpm';
	readonly installCommand: string = 'install';
	readonly packageName: string = 'pnpm';
	readonly uninstallCommand: string = 'uninstall';
	readonly installDevFlag: string = '--dev';

	_detect(): Promise<boolean> {
		return this._detectFile('pnpm-lock.yaml');
	}
}
