import { createRootLogger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { executeProjectCheck } from './common/check-project.js';
import { readPackageJson } from './common/package-json.js';

createRootLogger('lint');

await readPackageJson();

await executeProjectCheck();

shutdown(0);
