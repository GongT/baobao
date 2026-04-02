#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register/respawn';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const listfile = resolve(import.meta.dirname, '../src/commands.generated.ts');
if (!existsSync(listfile)) {
	const { default: packageJson } = await import('@build-script/codegen/package.json', { with: { type: 'json' } });
	const codegenRoot = dirname(fileURLToPath(import.meta.resolve('@build-script/codegen/package.json')));
	const codegenBin = resolve(codegenRoot, packageJson.bin['codegen']);
	const { execaNode } = await import('execa');
	console.error(`\x1B[s命令行列表文件不存在，调用 @build-script/codegen 生成`);
	await execaNode({
		stdio: 'inherit',
	})`${codegenBin} ${dirname(listfile)}`;

	process.stderr.write('\x1B[u\x1B[J');
}

process.title = `MpisPub`;

await import('../src/bin.ts');
