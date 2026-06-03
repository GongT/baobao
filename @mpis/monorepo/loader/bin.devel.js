#!/usr/bin/env -S node --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

process.title = `MpisMonorepo`;

await import('../src/bin.ts');
