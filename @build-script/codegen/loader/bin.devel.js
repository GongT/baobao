import { execute } from '@idlebox/esbuild-executer';

await execute(import.meta.resolve('../src/bin.ts'), { entries: [import.meta.resolve('../src/plugin.ts')] });
