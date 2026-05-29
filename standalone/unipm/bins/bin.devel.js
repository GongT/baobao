#!/usr/bin/env -S node --disable-warning=DEP0205 --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

process.title = `unipm`;

await import('../src/index.ts');
