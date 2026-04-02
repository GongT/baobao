import { logger } from '@idlebox/logger';
import { execa } from 'execa';
import { readFile, writeFile } from 'node:fs/promises';

export async function formatFile(file: string) {
	logger.debug`格式化文件 ${file}`;
	const r = await execa({ stdio: 'pipe', reject: false })`biome format --no-errors-on-unmatched --write ${file}`;

	if (r.failed) {
		throw new Error(`biome format failed:\n${r.stderr || r.shortMessage}`);
	}
}

export async function writeAsPlainJson(file: string, data: any) {
	const oldContent = await readFile(file, 'utf-8');

	// biome-ignore lint/style/useTemplate: too easy
	const newContent = JSON.stringify(data, null, 2) + '\n';

	if (oldContent === newContent) {
		return false;
	}
	await writeFile(file, newContent, 'utf-8');
	return true;
}
