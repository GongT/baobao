import { resolve } from 'node:path';
import { loadInheritedJson } from './default.js';

const content = await loadInheritedJson(resolve(import.meta.dirname, '../src/tsconfig.json'));
console.log(content);
