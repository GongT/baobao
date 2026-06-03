#!/usr/bin/env -S node --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

process.title = `unipm`;

await import('../src/index.ts');
