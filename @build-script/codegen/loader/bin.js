#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

await import('@idlebox/source-map-support/register');

process.title = `BsCodegen`;

Object.assign(globalThis, { CODEGEN_CLI: 'production' });
await import('../lib/loader.js');
