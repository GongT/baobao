#!/usr/bin/env node

import { execute } from '@idlebox/esbuild-executer/early-loader.js';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const entryPoint = resolve(import.meta.dirname, '../src', `${basename(import.meta.filename, '.js')}.ts`);
await execute(pathToFileURL(entryPoint).href);
