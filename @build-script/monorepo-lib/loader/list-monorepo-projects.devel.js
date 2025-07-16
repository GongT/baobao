#!/usr/bin/env node

import { execute } from '@idlebox/esbuild-executer';

await execute(import.meta.resolve('../src/bins/list-monorepo-projects.ts'));
