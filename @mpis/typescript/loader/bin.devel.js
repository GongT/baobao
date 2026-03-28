#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

process.exitCode = 1;
process.title = `MpisTsc`;

await import('../src/tsc.ts');
