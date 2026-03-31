#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `Trpc.Ex`;

await import('../lib/bin/index.js');
