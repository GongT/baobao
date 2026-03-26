import { generate } from '@build-script/autoindex/development';

await generate((import.meta as any).filename);
