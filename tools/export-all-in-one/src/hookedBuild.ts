import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

buildContext.args.forEach((item, index) => {
	buildContext.addAction('build', ['export-all-in-one' + index]);
	buildContext.registerAlias('export-all-in-one' + index, resolve(__dirname, '../index.js'), [item]);
});
