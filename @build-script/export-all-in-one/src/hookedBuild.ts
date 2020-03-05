import { buildContext } from '@build-script/builder';
import { resolve } from 'path';

export const NO_DUAL_FLAG = '--no-dual-package';
const args = buildContext.args.slice();

const flagIndex = args.findIndex((e) => e == NO_DUAL_FLAG);
const dualMode = flagIndex === -1;
if (!dualMode) {
	args.splice(flagIndex, 1);
}

if (args.length > 1) {
	args.forEach((item, index) => {
		const title = `export-all-in-one[${index}]`;
		buildContext.addAction('build', [title]);
		buildContext.registerAlias(title, resolve(__dirname, '../index.js'), wrapArg(item));
	});
} else {
	args.forEach((item) => {
		buildContext.addAction('build', ['export-all-in-one']);
		buildContext.registerAlias('export-all-in-one', resolve(__dirname, '../index.js'), wrapArg(item));
	});
}
function wrapArg(p: string) {
	if (dualMode) {
		return [p];
	} else {
		return [NO_DUAL_FLAG, p];
	}
}
