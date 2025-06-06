import { createWorker, x } from './common/share-lib.js';

console.log('tsfile is run, x=%s', x);

await createWorker();
export const x1 = x;
