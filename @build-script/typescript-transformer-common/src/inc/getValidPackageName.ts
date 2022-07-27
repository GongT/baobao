import { findUpUntilSync } from '@idlebox/node';
import { resolve } from 'path';

export function getValidPackageFile(startPoint: string): string | undefined {
	let searching: string | null = startPoint;
	try {
		while (startPoint) {
			searching = findUpUntilSync(searching, 'package.json');
			if (!searching) {
				break;
			}

			const pkg = require(searching);
			if (pkg.name && pkg.version) {
				return searching;
			}
			searching = resolve(searching, '../..');
		}
	} catch {}
	return;
}
