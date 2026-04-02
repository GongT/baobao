import esbuild from 'esbuild';
import { makeConfig } from '../scripts/config.js';

esbuild.buildSync(makeConfig(true));

await import('../lib/register-if-not.js');
