import { manifest } from 'pacote';
import { getNpmConfigValue } from '@idlebox/node';
import asyncPool from 'tiny-async-pool';

async function resolveNpmVersion([packageName, currentVersion]: string[]) {
	const pkgjson = await manifest(packageName + '@latest', { offline: true });
	const newVersion = '^' + pkgjson.version;
	return [packageName, newVersion, currentVersion];
}

export async function resolveNpm(versions: Map<string, string>) {
	let i = 1;
	const total = versions.size;
	const padto = total.toFixed(0).length;

	const nc = parseInt((await getNpmConfigValue('network-concurrency')) || '4');

	for await (const [packName, newVersion, currentVersion] of asyncPool(
		nc,
		[...versions.entries()],
		resolveNpmVersion
	)) {
		versions.set(packName, newVersion);

		let updated = '';
		if (currentVersion && currentVersion != newVersion) {
			updated = ` (from ${currentVersion})`;
		}

		console.log(`  - [${i.toFixed().padStart(padto, ' ')}/${total}] ${packName}: ${newVersion}${updated}`);
		i++;
	}

	return versions;
}
