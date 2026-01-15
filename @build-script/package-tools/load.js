#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `PkgTool`;

await import('./lib/main.js');
