#!/usr/bin/env node

import { execute } from '@idlebox/esbuild-executer';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const entryPoint = resolve(import.meta.dirname, '../src/bin.ts');
await execute(pathToFileURL(entryPoint).href);
