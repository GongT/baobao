import { getNpmConfigValue } from '@idlebox/node';
import { manifest } from 'pacote';
import asyncPool from 'tiny-async-pool';

async function resolveNpmVersion([packageName, currentVersion]: [string, string]) {
	const d = new Date();
	d.setMinutes(d.getMinutes() - 1);

	let lastError;
	let retryCnt = 5;
	let currentTry = 0;
	let maxRetry = 100;
	while (--retryCnt && --maxRetry && ++currentTry) {
		try {
			const pkgjson = await manifest(packageName + '@latest', { before: d });
			const newVersion = '^' + pkgjson.version;
			return [packageName, newVersion, currentVersion];
		} catch (e: any) {
			console.error('[try %s] failed fetch package %s: [%s] %s', currentTry, packageName, e.code, e.message);
			lastError = e;
			if (e.code === 'ECONNRESET') {
				retryCnt++;
			}
		}
	}
	throw lastError;
}

const cs = process.stdout.isTTY ? '\x1B[38;5;12m' : '';
const ce = process.stdout.isTTY ? '\x1B[0m' : '';

export async function resolveNpm(versions: Map<string, string>) {
	let i = 1;
	const total = versions.size;
	const padto = total.toFixed(0).length;

	const nc = parseInt((await getNpmConfigValue('network-concurrency')) || '4');

	for await (const [packName, newVersion, currentVersion] of asyncPool(
		nc,
		[...versions.entries()],
		resolveNpmVersion,
	)) {
		versions.set(packName, newVersion);

		let updated = '';
		if (currentVersion && currentVersion != newVersion) {
			updated = ` ${cs}(from ${currentVersion})${ce}`;
		}

		console.log(`  - [${i.toFixed().padStart(padto, ' ')}/${total}] ${packName}: ${newVersion}${updated}`);
		i++;
	}

	return versions;
}
