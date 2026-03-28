#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';
import { execaNode } from 'execa';
import { resolve } from 'node:path';

process.title = `PkgTool`;

try {
	await import('../src/commands.generated.ts');
} catch {
	await execaNode({ stdio: 'inherit' })`${resolve(import.meta.dirname, '../../codegen/loader/bin.devel.js')} ${resolve(import.meta.dirname, '../src')}`;
}

await import('../src/main.ts');
