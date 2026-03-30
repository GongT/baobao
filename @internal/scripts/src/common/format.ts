import { execa } from 'execa';

export async function formatFile(file: string) {
	const r = await execa({ stdio: 'pipe', reject: false })`biome format --no-errors-on-unmatched --write ${file}`;

	if (r.failed) {
		throw new Error(`biome format failed:\n${r.stderr || r.shortMessage}`);
	}
}
