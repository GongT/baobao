import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const dir = resolve(import.meta.filename || fileURLToPath(import.meta.url), 'temp');
if (!existsSync(dir)) {
	mkdirSync(dir);
}
const file = resolve(dir, 'watching');
if (!existsSync(file)) {
	writeFileSync(file, '1', 'utf-8');
}
