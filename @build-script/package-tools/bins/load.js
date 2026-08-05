#!/usr/bin/env node

import { setSourceMapsSupport } from 'node:module';
setSourceMapsSupport(true, { generatedCode: true, nodeModules: true });

process.title = `PkgTool`;

const { main_static: main } = await import('../lib/cli.js');

await main();
