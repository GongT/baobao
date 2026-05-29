#!/usr/bin/env -S node --disable-warning=DEP0205 --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

process.title = `MpisRun`;

await import('../src/bin.ts');
