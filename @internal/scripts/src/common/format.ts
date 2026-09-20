import { logger } from '@idlebox/logger';
import { execa } from 'execa';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';

export async function formatFile(file: string) {
	logger.debug`格式化文件 ${file}`;
	const r = await execa({ stdio: 'pipe', reject: false })`biome format --no-errors-on-unmatched --write ${file}`;

	if (r.failed) {
		throw new Error(`biome格式化失败:\n${r.stderr || r.shortMessage}`);
	}
}

export async function writeAsPlainJson(file: string, data: any) {
	const oldContent = await readFile(file, 'utf-8');

	const tempFile = `${dirname(file)}/.new.${basename(file)}`;
	await writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
	await formatFile(tempFile);
	const newContent = await readFile(tempFile, 'utf-8');
	await unlink(tempFile);

	if (oldContent.trim() === newContent.trim()) {
		return false;
	}

	const line = '-'.repeat(process.stdout.columns || 80);
	console.log(line);
	console.log(oldContent);
	console.log(line);
	console.log(newContent);
	console.log(line);

	await writeFile(file, newContent, 'utf-8');
	return true;
}
