import { dirname } from 'path';
import { RushStackConfig } from './api';

const c = new RushStackConfig(dirname(__dirname));
c.typescriptSearchSrcFolder = true;
console.log('tsconfig = %s', c.tsconfigPath());
console.log(c.tsconfig());
