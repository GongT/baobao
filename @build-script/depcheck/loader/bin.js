#!/usr/bin/env node

import '@idlebox/source-map-support/register';

process.title = `BsDepcheck`;

await import('../lib/bin.js');
