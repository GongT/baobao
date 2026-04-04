import { argv } from '@idlebox/args/default';
import { logger } from '@idlebox/logger';
import { readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import process from 'node:process';
import { monorepoRoot } from '../common/paths/root.js';

const rawTimestamp = argv.at(0);

if (!rawTimestamp) {
	console.error('[check-memory] 用法: check-memory <unix-timestamp>');
	process.exit(1);
}

const timestamp = parseInt(rawTimestamp, 10);
if (Number.isNaN(timestamp)) {
	console.error('[check-memory] 无效的时间戳: %s', rawTimestamp);
	process.exit(1);
}

// unix timestamp 单位为秒，mtimeMs 单位为毫秒
const thresholdMs = timestamp * 1000;
logger.debug`thresholdMs: ${thresholdMs}`;

const agentDir = resolve(monorepoRoot, '.agent');

async function walkDir(dir: string): Promise<void> {
	const entries = await readdir(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = resolve(dir, entry.name);
		if (entry.isDirectory()) {
			await walkDir(fullPath);
		} else if (entry.isFile()) {
			const fileStat = await stat(fullPath);
			logger.verbose` - checking ${fullPath}, mtimeMs: ${fileStat.mtimeMs}`;
			if (fileStat.mtimeMs > thresholdMs) {
				logger.success`this file is newer than threshold: ${fullPath}`;
				process.exit(1);
			}
		}
	}
}

await walkDir(agentDir);

logger.success`everything is up to date.`;
process.exit(0);
