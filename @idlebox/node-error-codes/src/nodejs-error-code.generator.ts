import type { GenerateContext } from '@build-script/codegen';
import * as assert from 'node:assert';
import { readFile } from 'node:fs/promises';
import type API_JSON from './cache.generated.json';

const API_SOURCE = 'https://nodejs.org/api/errors.json';

export async function generate(context: GenerateContext) {
	const cache_file = context.file('cache.json');
	let content = '';

	let body: typeof API_JSON;
	try {
		body = JSON.parse(await readFile(cache_file.absolutePath, 'utf-8'));
		console.log('use exists api json at %s', cache_file.absolutePath);
	} catch {}

	if (!body) {
		console.log('download api json from %s', API_SOURCE);
		const resp = await fetch(API_SOURCE);
		body = (await resp.json()) as any;
	}

	assert.ok(body.miscs?.[0]?.name === 'Errors', 'api json struct change');

	cache_file.append(JSON.stringify(body, null, 2));

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
