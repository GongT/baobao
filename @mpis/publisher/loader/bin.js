#!/usr/bin/env node

import { setSourceMapsSupport } from 'node:module';
setSourceMapsSupport(true, { generatedCode: true, nodeModules: true });

process.title = `MpisPub`;

await import('../lib/bin.js');
