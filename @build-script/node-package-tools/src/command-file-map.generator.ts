import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

export async function generate(b) {
	const map = {};
	const root = resolve(__dirname, 'commands');
	b.watchFiles(root);
	for (const name of readdirSync(root)) {
		if (!name.endsWith('.ts')) {
			continue;
		}
		const parts = name.split('.');
		if (parts.length !== 2) {
			throw new Error(`Invalid command file name: ${name}`);
		}
		const cmdName = parts[0];
		const file = `./commands/${cmdName}.js`;
		map[cmdName] = file;
	}
	return `export default ${JSON.stringify(map, null, '\t')} as const;\n`;
}
