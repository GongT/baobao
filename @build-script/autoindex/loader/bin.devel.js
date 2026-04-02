#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register/respawn';

process.title = `BsAutoindex`;

await import('../package.json', { with: { type: 'json' } });

// await execute(import.meta.resolve('../src/bin.ts'), { entries: [import.meta.resolve('../src/plugin.ts')] });
await import('../src/bin.js');
