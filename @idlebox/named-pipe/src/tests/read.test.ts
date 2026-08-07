import { logger } from '@idlebox/logger';
import { CollectingStream, osTempDir } from '@idlebox/node';
import { execaNode } from 'execa';
import { randomBytes } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createNamedPipe } from '../index.js';

// createRootLogger('', EnableLogLevel.verbose);

const tempDir = osTempDir('named-pipe-test-read');
beforeAll(async () => {
	await mkdir(tempDir, { recursive: true });
});
afterAll(async () => {
	// await rm(tempDir, { recursive: true });
});
function rnd() {
	return resolve(tempDir, randomBytes(4).toHex());
}

function writeScript(text: string, file: string) {
	const fileStr = JSON.stringify(file);

	let script = 'import { writeFileSync } from "node:fs";';
	for (let line of text.trimEnd().split('\n')) {
		line += '\n';
		script += `writeFileSync(${fileStr}, ${JSON.stringify(line)});`;
		script += `await new Promise(resolve => setTimeout(resolve, 100));`;
	}
	return script;
}

describe('作为读取端', () => {
	it('可以读取写入的数据', async () => {
		await using pipe = createNamedPipe(rnd(), { logger: logger });
		await pipe.create();

		const reader = await pipe.read();
		const collect = new CollectingStream(reader);

		const script = writeScript('hello\nworld\n', pipe.name);
		const p = execaNode`-e ${script}`;

		await Promise.race([
			p,
			// poll
			expect.poll(() => collect.getOutput()).toEqual('hello\nworld\n'),
		]);
	});
});
