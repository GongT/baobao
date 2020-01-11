import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

buildContext.addAction('build', ['single-dog']);
buildContext.registerAlias('single-dog', resolve(__dirname, '../bin.js'));
