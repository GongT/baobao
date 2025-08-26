#!/usr/bin/env node

import { execute } from '@idlebox/esbuild-executer';

process.title = `BsDepcheck`;

await execute(import.meta.resolve('../src/bin.ts'));
