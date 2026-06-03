#!/usr/bin/env -S node --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';
import { execaNode } from 'execa';
import { resolve } from 'node:path';

process.title = `PkgTool`;

try {
	await import('../src/commands.generated.ts');
} catch {
	await execaNode({ stdio: 'inherit' })`${resolve(import.meta.dirname, '../../codegen/loader/bin.devel.js')} ${resolve(import.meta.dirname, '../src')}`;
}

await import('../src/main.ts');
