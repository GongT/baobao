#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `BsAutoindex`;

await import('../lib/bin.js');
