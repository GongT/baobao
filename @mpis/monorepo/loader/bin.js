#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `MpisMonorepo`;

await import('../lib/bin.js');
