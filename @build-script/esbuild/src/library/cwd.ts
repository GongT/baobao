import { resolve } from 'node:path';

export const workingDir = process.cwd();
export const distDir = resolve(workingDir, 'dist');
