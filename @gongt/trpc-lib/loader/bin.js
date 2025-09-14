#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `Trpc.Gen`;

await import('../lib/bin/index.js');
