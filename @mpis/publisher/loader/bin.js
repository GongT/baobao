#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `MpisPub`;

await import('../lib/bin.js');
