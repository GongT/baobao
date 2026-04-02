import { packageJson } from '@internal/scripts';
import { appendFileSync, rmSync } from 'node:fs';

packageJson.exports['./register'] = './lib/register-if-not.js';
packageJson.exports['./register/respawn'] = './lib/register-or-respawn.js';
packageJson.imports['#generate-prefix'] = './lib/generate-prefix.js';

appendFileSync('.npmignore', 'scripts/\n');

rmSync('./lib/tools', { recursive: true, force: true });
