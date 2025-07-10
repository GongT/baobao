#!/usr/bin/env node

const { install } = import('source-map-support');
install();

await import('./lib/bin.js');
