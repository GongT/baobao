#!/usr/bin/env node

import '@idlebox/native-executer/register';

process.title = `BsAutoindex`;

await import('../package.json', { with: { type: 'json' } });

// await execute(import.meta.resolve('../src/bin.ts'), { entries: [import.meta.resolve('../src/plugin.ts')] });
await import('../src/bin.js');
