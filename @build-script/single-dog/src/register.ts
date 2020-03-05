import { buildContext } from '@build-script/builder';
import { resolve } from 'path';

buildContext.addAction('build', ['single-dog']);
buildContext.registerAlias('single-dog', resolve(__dirname, '../bin.js'));
