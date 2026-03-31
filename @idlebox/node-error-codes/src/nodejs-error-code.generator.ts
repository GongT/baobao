import type { GenerateContext } from '@build-script/codegen';
import * as assert from 'node:assert';
import { execa } from 'execa';
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import type API_JSON from './cache.generated.json';

const API_SOURCE = 'https://nodejs.org/api/errors.json';

export async function generate(_context: GenerateContext) {
	const cache_file = resolve(await getCachePath(), 'cache.json');
	let content = '';

	let body: typeof API_JSON;
	try {
		body = JSON.parse(await readFile(cache_file, 'utf-8'));
		console.log('use exists api json at %s', cache_file);
	} catch {}

	if (!body) {
		let retry = 5;
		while (retry > 0) {
			try {
				console.log('download api json from %s', API_SOURCE);
				const resp = await fetch(API_SOURCE);
				body = (await resp.json()) as any;
				break;
			} catch (_e) {
				console.log('download failed, retrying...');
				retry--;
			}
		}
	}

	assert.ok(body.miscs?.[0]?.name === 'Errors', 'api json struct change');

	await writeFile(cache_file, content);

	function get_id(id: string) {
		for (const section of body.miscs[0].miscs) {
			if (section.name === id) {
				return section.modules;
			}
		}
		throw new Error(`missing section: ${id}`);
	}
	content += 'export enum NodeErrorCode {\n';
	for (const err of get_id('node.js_error_codes')) {
		content += line(err.textRaw, err.desc, false);
	}
	content += '\n';
	for (const err of get_id('legacy_node.js_error_codes')) {
		content += line(err.textRaw, err.desc, true);
	}
	content += '}\n\n';

	content += 'export enum OpenSSLErrorCode {\n';
	for (const section of get_id('openssl_error_codes')) {
		for (const err of (section as any).modules) {
			content += line(err.textRaw, err.desc, false);
		}
	}
	content += '}\n';

	return content;
}

function line(text: string, desc: string, legacy: boolean) {
	let ret = `\t/**\n${desc.replace(/^/gm, '\t * ')}\n`;
	if (legacy) {
		ret += '\t * @deprecated\n';
	}
	ret += '\t */\n';

	const plain = text.replaceAll('`', '').trim();
	ret += `\t${plain} = '${plain}',\n`;

	return ret;
}

async function getCachePath() {
	const r = (await execa('npm', ['config', 'get', 'cache'], { stdio: 'pipe', encoding: 'utf8' })).stdout.trim();
	if (r) return r;

	return tmpdir();
}
