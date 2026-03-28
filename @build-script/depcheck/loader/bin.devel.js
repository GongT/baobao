#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

process.title = `BsDepcheck`;

await import('../src/bin.ts');
