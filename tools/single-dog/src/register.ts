import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

buildContext.prefixAction('build', 'im-single-dog');
buildContext.registerJob('im-single-dog', resolve(__dirname, '../bin.js'));
