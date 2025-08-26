#!/usr/bin/env node

import { execute } from '@idlebox/esbuild-executer/early-loader.js';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

process.title = `MpisMonorepo`;

const entryPoint = resolve(import.meta.dirname, '../src/bin.ts');
await execute(pathToFileURL(entryPoint).href);
