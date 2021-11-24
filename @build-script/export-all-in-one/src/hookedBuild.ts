import { resolve } from 'path';
import { buildContext } from '@build-script/builder';

const args = buildContext.args.slice();

if (args.length > 1) {
	args.forEach((item, index) => {
		const title = `export-all-in-one[${index}]`;
		buildContext.addAction('build', [title]);
		buildContext.registerAlias(title, resolve(__dirname, '../index.cjs'), [item]);
	});
} else {
	args.forEach((item) => {
		buildContext.addAction('build', ['export-all-in-one']);
		buildContext.registerAlias('export-all-in-one', resolve(__dirname, '../index.cjs'), [item]);
	});
}
