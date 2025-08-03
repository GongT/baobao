import { getNpmConfigValue } from '@idlebox/node';
import pacote from 'pacote';
import asyncPool from 'tiny-async-pool';

/**
 * 将包规范字符串分割为包名和版本号
 * @param value package spec, e.g. `@x/y@ver` or `@x/y`
 */
export function splitPackageSpecSimple(value: string) {
	const at = value.indexOf('@', 1);
	if (at === -1) return [value, '']; // @xxx/yyy | xxx
	return [value.slice(0, at), value.slice(at + 1)]; // zzz@ver
}

export const isSingleVersionString = /^(?<prefix>[><]=?|[~^])?(?<version>(\d+\.)*\d+(-\S+)?)$/;

/**
 * 检查版本号是否是 version 或者 npm:@package@version 的格式
 * 然后返回alias和version
 */
export function splitAliasVersion(version: string): [string, string] {
	const m = version.match(isSingleVersionString);
	if (m?.groups?.version) {
		return ['', m.groups.version];
	}

	if (version.startsWith('npm:')) {
		const [alias, ver] = splitPackageSpecSimple(version.slice(4));
		const m = ver.match(isSingleVersionString);
		if (m?.groups?.version) {
			return [alias, m.groups.version];
		}
	}

	return ['', ''];
}

async function resolveNpmVersion([packageName, currentVersion]: [string, string]) {
	let lastError: any;
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
			const pkgjson = await pacote.manifest(`${packageReference}@latest`, { before: d });
			let newVersion = `^${pkgjson.version}`;
			if (packageReference !== packageName) {
				newVersion = `npm:${packageReference}@${newVersion}`;
			}

			return [packageName, newVersion, currentVersion];
		} catch (e: any) {
			console.error('[npm:resolve][try %s] failed fetch package "%s": [%s] %s', currentTry, packageName, e.code, e.message);
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

	for await (const [packName, newVersion, currentVersion] of asyncPool(nc, [...versions.entries()], resolveNpmVersion)) {
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
