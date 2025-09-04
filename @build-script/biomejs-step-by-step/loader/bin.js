#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `biome-step`;

await import('../lib/bin.js');
