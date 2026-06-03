#!/usr/bin/env -S node --enable-source-maps

import '@idlebox/native-executer/register/respawn';

import { basename } from 'node:path';

await import('../src/common/execute-prefix.ts');

const entryPoint = import.meta.resolve(`../src/${basename(import.meta.filename, '.js')}.ts`);
await import(entryPoint);
