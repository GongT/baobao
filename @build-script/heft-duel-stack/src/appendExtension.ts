import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { RushStackConfig } from '@build-script/rushstack-config-loader';
import { md5 } from '@idlebox/node';
import { IMyOptions } from './plugin';

import type { HeftConfiguration, HeftSession } from '@rushstack/heft';
import { createRequire } from 'module';
declare const global: any;

function monkeyPatchBuilder(file: string, exports: any) {
	const patchFile = readFileSync(resolve(__dirname, 'monkeyPatch.js'));
	const hash = md5(patchFile);
	const sig = `/* __MonkeyPatch__:${hash}\n`;

	let fileData = readFileSync(file, 'utf-8');

	if (fileData.includes(sig)) {
		return;
	}

	console.log(`[monkey-patch] modify ${file}`);
	const found = fileData.indexOf('/* __MonkeyPatch__:');
	if (found > 0) {
		fileData = fileData.slice(0, found);
	}
	fileData = fileData.trimEnd() + '\n';
	fileData += sig + patchFile;
	writeFileSync(file, fileData);

	if (exports) {
		delete require.cache[file];
		console.error('[monkey-patch] assign self');
		Object.assign(exports, require(file));
	}
}

export function applyAppendExtension(
	_heftSession: HeftSession,
	heftConfiguration: HeftConfiguration,
	_config: RushStackConfig,
	_options: IMyOptions
) {
	let heft_found = '';
	for (const file of Object.keys(require.cache)) {
		if (file.endsWith('TypeScriptBuilder.js')) {
			monkeyPatchBuilder(file, require.cache[file]!.exports);
			return;
		}
		if (file.endsWith('@rushstack/heft/lib/index.js')) {
			heft_found = file;
		}
	}

	if (heft_found) {
		const resolver = createRequire(heft_found).resolve;
		const file = resolver('./plugins/TypeScriptPlugin/TypeScriptBuilder');
		monkeyPatchBuilder(file, undefined);
	} else {
		heftConfiguration.globalTerminal.writeError('can not resolve ');
	}
}
