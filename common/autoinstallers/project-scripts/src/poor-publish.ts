import 'source-map-support/register';

import { doSpawn } from './include/doSpawn';
doSpawn('poor-publish-script.js', process.argv.slice(2));
