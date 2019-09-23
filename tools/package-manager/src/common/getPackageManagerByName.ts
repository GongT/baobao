import { Cnpm } from '../package-managers/cnpm';
import { Npm } from '../package-managers/npm';
import { Pnpm } from '../package-managers/pnpm';
import { Rush } from '../package-managers/rush';
import { Yarn } from '../package-managers/yarn';
import { PackageManagerConstructor } from './packageManager';

export const KNOWN_PACKAGE_MANAGERS: PackageManagerConstructor[] = [Npm, Cnpm, Yarn, Pnpm, Rush];

export interface IOptions {
	cwd: string;
	default: 'npm' | 'yarn' | 'rush' | 'cnpm' | 'auto';
	ask: boolean;
}

export function getPackageManagerByName(name: string): PackageManagerConstructor | undefined {
	for (const ctr of KNOWN_PACKAGE_MANAGERS) {
		if (name.toLowerCase() === ctr.name.toLowerCase()) {
			return ctr;
		}
	}
}
