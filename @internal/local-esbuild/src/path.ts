import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../../../../');
export const TEMP_DIR = resolve(ROOT_DIR, 'common/temp');
