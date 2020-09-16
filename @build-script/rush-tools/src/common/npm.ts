import { manifest } from "pacote";

async function resolveNpmVersion(packageName: string) {
	return (
		"^" +
		(await manifest(packageName + "@latest", { offline: true })).version
	);
}
export async function resolveNpm(versions: Map<string, string>) {
	let i = 1;
	const total = versions.size;
	const padto = total.toFixed(0).length;

	for (const [packName, currentVersion] of versions.entries()) {
		const ver = await resolveNpmVersion(packName);
		versions.set(packName, ver);

		let updated = "";
		if (currentVersion && currentVersion != ver) {
			updated = ` (from ${currentVersion})`;
		}

		console.log(
			`  - [${i
				.toFixed()
				.padStart(padto, " ")}/${total}] ${packName}: ${ver}${updated}`
		);
		i++;
	}
	return versions;
}
