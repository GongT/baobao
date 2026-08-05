#!/usr/bin/env node

process.env.NODE_DEBUG = 'EXPORT';

import { setSourceMapsSupport } from 'node:module';
setSourceMapsSupport(true, { generatedCode: true, nodeModules: true });

await import('./lib/test.js');
