import { dirname } from 'node:path';
import { ProjectConfig } from './common/config.js';
import { tsconfig, typescriptProject } from './tools/typescript.js';

const c = new ProjectConfig(dirname(__dirname));
console.log('tsconfig = %s', await typescriptProject(c));
console.log(await tsconfig(c));
