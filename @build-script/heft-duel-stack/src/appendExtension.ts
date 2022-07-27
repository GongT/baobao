import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { RushStackConfig } from '@build-script/rushstack-config-loader';
import { md5 } from '@idlebox/node';
import { IMyOptions } from './plugin';

import type { HeftConfiguration, HeftSession } from '@rushstack/heft';
import { createRequire } from 'module';
declare const global: any;

function transform(data: string) {
	if (__filename.endsWith('.ts')) {
		const ts: typeof import('typescript') = require('typescript');
		const output = ts.transpileModule(data, {
			compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ESNext, noEmitHelpers: true },
		});
		return output.outputText;
	} else {
		return data;
	}
}

function getSrouceData() {
	if (__filename.endsWith('.ts')) {
		return readFileSync(resolve(__dirname, 'monkeyPatch.ts'), 'utf-8');
	} else {
		return readFileSync(resolve(__dirname, 'monkeyPatch.js'), 'utf-8');
	}
}

function monkeyPatchBuilder(targetFile: string, exports: any) {
	const patchFileData = getSrouceData();
	const hash = md5(Buffer.from(patchFileData));
	const sig = `/* __MonkeyPatch__:${hash}\n`;

	const originalData = readFileSync(targetFile, 'utf-8');
	let targetData = originalData;

	if (targetData.includes(sig)) {
		return;
	}

	console.log(`[monkey-patch] modify ${targetFile}`);
	const found = targetData.indexOf('/* __MonkeyPatch__:');
	if (found > 0) {
		targetData = targetData.slice(0, found);
	}
	targetData = targetData.trimEnd() + '\n';
	targetData += sig + transform(patchFileData);
	writeFileSync(targetFile, targetData);

	delete require.cache[targetFile];

	try {
		require(targetFile);
	} catch (e: any) {
		console.error(`[monkey-patch] error require, revert content... ${e.message}`);
		writeFileSync(targetFile, originalData);
		throw e;
	}

	if (exports) {
		console.log('[monkey-patch] assign self');
		Object.assign(exports, require(targetFile));
	}
}

export function applyAppendExtension(
	_heftSession: HeftSession,
	_heftConfiguration: HeftConfiguration,
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
		throw new Error('can not resolve heft from require.cache');
	}
}
