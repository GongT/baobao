#!/usr/bin/env node

import { execute } from '@idlebox/esbuild-executer';

process.title = `BsAutoindex`;

await execute(import.meta.resolve('../src/bin.ts'), { entries: [import.meta.resolve('../src/plugin.ts')] });
