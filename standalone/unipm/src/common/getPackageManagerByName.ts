import { Npm } from '../package-managers/npm.js';
import { Pnpm } from '../package-managers/pnpm.js';
import { Rush } from '../package-managers/rush.js';
import { Yarn } from '../package-managers/yarn.js';
import { PackageManagerConstructor } from './packageManager.js';

export const KNOWN_PACKAGE_MANAGERS: PackageManagerConstructor[] = [Npm, Yarn, Pnpm, Rush];
export const KNOWN_PACKAGE_MANAGER_NAMES: string[] = ['npm', 'yarn', 'pnpm', 'rush'];

export function getPackageManagerByName(name: string): PackageManagerConstructor | undefined {
	for (const ctr of KNOWN_PACKAGE_MANAGERS) {
		if (name.toLowerCase() === ctr.name.toLowerCase()) {
			return ctr;
		}
	}
	return undefined;
}
