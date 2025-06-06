import { execute } from '../lib/index.js';
const tsFile = import.meta.resolve('./tsfile.ts');
const workerFile = import.meta.resolve('./common/worker.ts');

console.log('[test] try import by esbuild:\n  entry = %s\n  extra = %s', tsFile, workerFile);

const exports = await execute(tsFile, { entries: [workerFile] });

console.log('[test] exports:', exports);

export const wowSuchX = exports.x1;
