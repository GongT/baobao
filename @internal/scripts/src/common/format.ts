import { logger } from '@idlebox/logger';
import { execa } from 'execa';
import { readFile, writeFile } from 'node:fs/promises';

async function _formatFile11(file: string) {
	logger.debug`格式化文件 ${file}`;
	const r = await execa({ stdio: 'pipe', reject: false })`biome format --no-errors-on-unmatched --write ${file}`;

	if (r.failed) {
		throw new Error(`biome格式化失败:\n${r.stderr || r.shortMessage}`);
	}
}

async function _writeAsPlainJson11(file: string, data: any) {
	const oldContent = await readFile(file, 'utf-8');

	await writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
	await formatFile(file);
	const newContent = await readFile(file, 'utf-8');

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
