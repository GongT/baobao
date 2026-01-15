#!/usr/bin/env node
import '@idlebox/source-map-support/register';

process.title = `unipm`;
await import('./lib/index.js');
