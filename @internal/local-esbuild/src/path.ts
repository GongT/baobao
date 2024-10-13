import { resolve } from 'path';
import { fileURLToPath } from 'url';

export const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../../../../');
export const TEMP_DIR = resolve(ROOT_DIR, 'common/temp');
