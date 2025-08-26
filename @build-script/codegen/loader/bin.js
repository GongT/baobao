#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `BsCodegen`;

await import('../lib/bin.js');
