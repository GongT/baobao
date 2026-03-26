#!/usr/bin/env node

process.title = `MpisTsc`;

import { execute } from '@idlebox/esbuild-executer';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const entryPoint = resolve(import.meta.dirname, '../src/tsc.ts');
await execute(pathToFileURL(entryPoint).href);
