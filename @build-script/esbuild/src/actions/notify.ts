import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = resolve(import.meta.filename || fileURLToPath(import.meta.url), 'temp');
if (!existsSync(dir)) {
	mkdirSync(dir);
}
const file = resolve(dir, 'watching');
if (!existsSync(file)) {
	writeFileSync(file, '1', 'utf-8');
}
