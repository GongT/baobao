import { PackageManager, PackageManagerType } from '../common/packageManager.js';

/** @internal */
export class Pnpm extends PackageManager {
	readonly type = PackageManagerType.PNPM;
	readonly friendlyName: string = 'pnpm';
	readonly cliName: string = 'pnpm';
	readonly installCommand: string = 'add';
	readonly packageName: string = 'pnpm';
	readonly uninstallCommand: string = 'remove';
	readonly installDevFlag: string = '-D';
	readonly syncCommand: string = 'i';

	_detect(): Promise<boolean> {
		return this._detectFile('pnpm-lock.yaml');
	}
}
