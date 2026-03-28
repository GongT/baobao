#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

process.title = `BsCodegen`;

Object.assign(globalThis, { CODEGEN_CLI: 'development' });
await import('../src/loader.js');
