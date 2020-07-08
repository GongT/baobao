import { manifest } from 'pacote';

async function resolveNpmVersion(packageName: string) {
	return '^' + (await manifest(packageName + '@latest', { offline: true })).version;
}
export async function resolveNpm(versions: Map<string, string>) {
	const list = [...versions.keys()];
	let i = 1;
	const total = list.length;
	const padto = total.toFixed(0).length;

	for (const packName of list) {
		const ver = await resolveNpmVersion(packName);
		versions.set(packName, ver);

		console.log(`  - [${i.toFixed().padStart(padto, ' ')}/${total}] ${packName}: ${ver}`);
		i++;
	}
	return versions;
}
