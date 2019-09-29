import { resolve } from 'path';

const { buildContext } = require('@idlebox/build-script');
buildContext.addAction('build', ['export-all-in-one']);
buildContext.registerAlias('export-all-in-one', resolve(__dirname, '../index.js'), buildContext.args);
