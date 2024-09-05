import { resolve } from 'path';

export const workingDir = process.cwd();
export const distDir = resolve(workingDir, 'dist');
