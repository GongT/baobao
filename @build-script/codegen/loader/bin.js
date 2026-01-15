#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `BsCodegen`;

Object.assign(globalThis, { CODEGEN_CLI: 'production' });
await import('../lib/bin.js');
