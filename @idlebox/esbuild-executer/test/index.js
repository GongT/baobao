import { execute } from '../lib/index.js';
const tsFile = import.meta.resolve('./tsfile.ts');
const workerFile = import.meta.resolve('./worker.ts');

console.log('[test] try import:', tsFile);

const exports = await execute(tsFile, { entries: [workerFile] });

console.log('[test] exports:', exports);

export const wowSuchX = exports.x1;
