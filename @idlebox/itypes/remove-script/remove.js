const { readFileSync, writeFileSync } = require('node:fs');
const { resolve } = require('node:path');

module.exports.remove = (cwd) => {
	const pkgFile = resolve(cwd, 'package.json');
	const pkg = require(pkgFile);
	const typingFile = pkg.types || pkg.typings;

	if (!typingFile) {
		throw new Error(`missing types field in ${pkgFile}`);
	}

	const targetDts = resolve(cwd, typingFile);
	console.log('[@idlebox/itypes] fixing file: %s', targetDts);
	const data = readFileSync(targetDts, 'utf-8');

	const mr = /^\/\/\/.+$/gm;
	for (const [line] of data.matchAll(mr)) {
		if (line.includes('@idlebox/itypes')) {
			console.log('[@idlebox/itypes] updated, write back');
			writeFileSync(targetDts, data.replace(line, '').trimStart(), 'utf-8');

			return;
		}
	}

	console.log('[@idlebox/itypes] no need update');
};
