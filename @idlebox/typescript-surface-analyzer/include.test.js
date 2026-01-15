#!/usr/bin/env node

process.env.NODE_DEBUG = 'EXPORT';
import '@idlebox/source-map-support/register';

await import('./lib/test.js');
