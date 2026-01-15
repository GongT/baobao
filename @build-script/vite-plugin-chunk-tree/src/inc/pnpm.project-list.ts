import { execaSync } from 'execa';

export interface IPnpmPackage {
	readonly name: string;
	readonly version: string;
	readonly path: string;
}

let cache: readonly IPnpmPackage[];

export function getPackageList() {
	if (!cache) {
		const packages = execaSync({
			stdio: ['ignore', 'pipe', 'inherit'],
			encoding: 'utf8',
		})`pnpm -r list --depth -1 --json`;

		const r = [];
		for (const item of JSON.parse(packages.stdout)) {
			if (!item.name) continue;
			r.push({
				name: item.name,
				version: item.version,
				path: item.path,
			});
		}
		cache = r;
	}
	return cache;
}
