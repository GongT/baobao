import { buildContext } from '@idlebox/build-script';
import { resolve } from 'path';

const DUAL_FLAG = '--dual-package';
const args = buildContext.args.slice();

const flagIndex = args.findIndex((e) => e == DUAL_FLAG);
const dualMode = flagIndex !== -1;
if (dualMode) {
	args.splice(flagIndex, 1);
}

if (args.length > 1) {
	args.forEach((item, index) => {
		const title = `export-all-in-one[${index}]`;
		buildContext.addAction('build', [title]);
		buildContext.registerAlias(title, resolve(__dirname, '../index.js'), [item]);
	});
} else {
	args.forEach((item) => {
		buildContext.addAction('build', ['export-all-in-one']);
		buildContext.registerAlias('export-all-in-one', resolve(__dirname, '../index.js'), [item]);
	});
}
