import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

buildContext.appendActionStep('build', 'im-single-dog');
buildContext.registerJob('im-single-dog', resolve(__dirname, '../bin.js'));
