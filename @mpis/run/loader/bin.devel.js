#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register/respawn';

process.title = `MpisRun`;

await import('../src/bin.ts');
