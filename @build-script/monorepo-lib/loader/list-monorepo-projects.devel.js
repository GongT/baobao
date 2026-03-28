#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

await import('../src/bins/list-monorepo-projects.ts');
