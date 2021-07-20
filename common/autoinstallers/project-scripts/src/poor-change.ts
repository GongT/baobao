import 'source-map-support/register';

import { doSpawn } from './include/doSpawn';
doSpawn('poor-change-script.js', process.argv.slice(2));
