import { getNpmConfigValue } from '@idlebox/node';
import { manifest } from 'pacote';
import asyncPool from 'tiny-async-pool';

async function resolveNpmVersion([packageName, currentVersion]: [string, string]) {
	let lastError;
	let packageReference = packageName;

	if (currentVersion.startsWith('workspace:')) {
		throw new Error('workspace package pass into npm resolver');
	}

	if (currentVersion.startsWith('npm:')) {
		packageReference = currentVersion.substring(4);
		const vsplit = packageReference.lastIndexOf('@');
		if (vsplit > 1) {
			packageReference = packageReference.substring(0, vsplit);
		}
	} else if (currentVersion.includes('/')) {
		console.error('[npm:resolve] version of "%s: %s" is not supported', packageName, currentVersion);
		return [packageName, currentVersion, currentVersion];
	}

	const d = new Date();
	d.setMinutes(d.getMinutes() - 1);
	let retryCnt = 5;
	let currentTry = 0;
	let maxRetry = 100;
	while (--retryCnt && --maxRetry && ++currentTry) {
		try {
			const pkgjson = await manifest(`${packageReference}@latest`, { before: d });
			let newVersion = `^${pkgjson.version}`;
			if (packageReference !== packageName) {
				newVersion = `npm:${packageReference}@${newVersion}`;
			}

			return [packageName, newVersion, currentVersion];
		} catch (e: any) {
			console.error(
				'[npm:resolve][try %s] failed fetch package "%s": [%s] %s',
				currentTry,
				packageName,
				e.code,
				e.message
			);
			lastError = e;
			if (e.code === 'ECONNRESET') {
				retryCnt++;
			} else if (e.code === 'E404') {
				return [packageName, currentVersion, currentVersion];
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

	const nc = Number.parseInt((await getNpmConfigValue('network-concurrency')) || '4');

	for await (const [packName, newVersion, currentVersion] of asyncPool(
		nc,
		[...versions.entries()],
		resolveNpmVersion
	)) {
		versions.set(packName, newVersion);

		let updated = '';
		if (currentVersion && currentVersion !== newVersion) {
			updated = ` ${cs}(from ${currentVersion})${ce}`;
		}

		console.log(`  - [${i.toFixed().padStart(padto, ' ')}/${total}] ${packName}: ${newVersion}${updated}`);
		i++;
	}

	return versions;
}

export function blacklistDependency(name: string, _version: string) {
	if (name === 'tslib') return true;
	return false;
}

export function splitPackageSpecSimple(value: string) {
	const at = value.indexOf('@', 1);
	if (at === -1) return [value, '']; // @x/y
	return [value.substring(0, at), value.substring(at + 1)]; // @x/y@ver
}
