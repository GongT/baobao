import { createArgsReader } from './interface.js';

export const argv = createArgsReader(process.argv.slice(2));
