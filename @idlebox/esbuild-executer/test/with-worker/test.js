import { execute } from '../../loader/index.devel.js';
const tsFile = import.meta.resolve('./tsfile.ts');
const workerFile = import.meta.resolve('./worker.ts');

console.log('[test] try import by esbuild:\n  entry = %s\n  extra = %s', tsFile, workerFile);

const exports = await execute(tsFile, { entries: [workerFile], write: true });

console.log('[test] exports:', exports);

export const wowSuchX = exports.x1;
