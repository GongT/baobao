import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

buildContext.prefixAction('build', 'export-all-in-one');
buildContext.registerJob('export-all-in-one', resolve(__dirname, '../index.js'));
