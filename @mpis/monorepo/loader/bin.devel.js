#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register/respawn';

process.title = `MpisMonorepo`;

await import('../src/bin.ts');
