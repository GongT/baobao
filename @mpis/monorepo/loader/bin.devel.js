#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

process.title = `MpisMonorepo`;

await import('../src/bin.ts');
