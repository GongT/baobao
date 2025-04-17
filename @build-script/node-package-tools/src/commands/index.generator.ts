import { readdirSync } from 'node:fs';

export async function generate(b) {
	const map = {};
	b.watchFiles(__dirname);
	for (const name of readdirSync(__dirname)) {
		if (!name.endsWith('.ts')) {
			continue;
		}
		const parts = name.split('.');
		if (parts.length !== 2) {
			continue;
		}
		const file = `./commands/${parts[0]}.js`;
		const cmdName = parts[0];
		map[cmdName] = file;
	}
	return 'export default ' + JSON.stringify(map, null, '\t') + ' as const;\n';
}
