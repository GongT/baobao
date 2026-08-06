import { generate } from '@build-script/autoindex/development';

process.stdout.write(`export * from '@idlebox/errors';\n`);

await generate((import.meta as any).filename);
