#!/usr/bin/env node

import { setSourceMapsSupport } from 'node:module';
setSourceMapsSupport(true, { generatedCode: true, nodeModules: true });

process.title = `BsCodegen`;

Object.assign(globalThis, { CODEGEN_CLI: 'production' });
await import('../lib/loader.js');
