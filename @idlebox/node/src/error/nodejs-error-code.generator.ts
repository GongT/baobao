import * as assert from 'node:assert';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type API_JSON from './cache.generated.json';

const temp = resolve(__dirname, 'cache.generated.json');
const API_SOURCE = 'https://nodejs.org/api/errors.json';

export async function generate() {
	let content = '';

	let body: typeof API_JSON;
	if (existsSync(temp)) {
		console.log('use api json at %s', temp);
		body = JSON.parse(await readFile(temp, 'utf-8'));
	} else {
		console.log('download api json from %s', API_SOURCE);
		const resp = await fetch(API_SOURCE);
		body = (await resp.json()) as any;

		await writeFile(temp, JSON.stringify(body, null, 2));
	}

	assert.ok(body.miscs?.[0]?.name === 'Errors', 'api json struct change');

	function get_id(id: string) {
		for (const section of body.miscs[0].miscs) {
			if (section.name === id) {
				return section.modules!;
			}
		}
		throw new Error(`missing section: ${id}`);
	}
	content += 'export enum NodeError {\n';
	for (const err of get_id('node.js_error_codes')) {
		content += line(err.textRaw, err.desc, false);
	}
	content += '\n';
	for (const err of get_id('legacy_node.js_error_codes')) {
		content += line(err.textRaw, err.desc, true);
	}
	content += '}\n\n';

	content += 'export enum OpenSSLError {\n';
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
