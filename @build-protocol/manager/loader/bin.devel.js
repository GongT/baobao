import { execute } from '@idlebox/esbuild-executer';
import { resolve } from 'node:path';

const entryPoint = resolve(import.meta.dirname, '../src/index.ts');
await execute(entryPoint);
