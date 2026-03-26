import { execa } from 'execa';

export async function formatFile(file: string) {
	await execa({ stdio: 'inherit' })`biome format --no-errors-on-unmatched --write ${file}`;
}
