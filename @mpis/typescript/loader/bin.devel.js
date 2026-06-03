#!/usr/bin/env -S node --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

process.exitCode = 1;
process.title = `MpisTsc`;

await import('../src/tsc.ts');
