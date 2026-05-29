#!/usr/bin/env -S node --disable-warning=DEP0205 --enable-source-maps --import=@idlebox/native-executer/register

import '@idlebox/native-executer/register/respawn';

process.title = `BsAutoindex`;

await import('../package.json', { with: { type: 'json' } });

// await execute(import.meta.resolve('../src/bin.ts'), { entries: [import.meta.resolve('../src/plugin.ts')] });
await import('../src/bin.js');
