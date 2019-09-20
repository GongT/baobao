import { context } from '@idlebox/build-script';
import { resolve } from 'path';

context.appendActionStep('build', 'im-single-dog');
context.registerJob('im-single-dog', resolve(__dirname, '../bin.js'));
