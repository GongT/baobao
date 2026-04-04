import { shutdown } from '@idlebox/node';
import { executeProjectCheck } from './common/check-project.js';
import { readPackageJson } from './common/package-json.js';

await readPackageJson();

await executeProjectCheck();

shutdown(0);
