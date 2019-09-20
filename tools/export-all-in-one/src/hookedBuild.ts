import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

buildContext.addAction('build', ['export-all-in-one']);
buildContext.registerAlias('export-all-in-one', resolve(__dirname, '../index.js'), context.arguments);
