import { findUpUntilSync, wrapConsoleLogger } from '@build-script/heft-plugin-base';
import { globSync } from 'glob';
import { dirname, resolve } from 'path';
import { GeneratorHolder } from './library/code-generator-holder.js';

const argv = process.argv.splice(2);
let project;
for (const item of argv) {
	if (item === '--debug') {
		continue;
	} else if (!project) {
		project = item;
	} else {
		console.error(`invalid option: ${item}\nusage: $0 package-dir`);
		process.exit(1);
	}
}

if (!project) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

const root = resolve(process.cwd(), project);
const files = globSync('**/*.generator.{ts,js}', { ignore: ['node_modules/**'], cwd: root, absolute: true });

async function main() {
	const logger = wrapConsoleLogger();

	const pkgRoot = findUpUntilSync(root, 'package.json');
	if (!pkgRoot) {
		throw new Error('failed find package.json from ' + root);
	}

	try {
		const generaters = new GeneratorHolder(logger, dirname(pkgRoot));
		generaters.makeGenerators(files, true);
		const result = await generaters.executeAll();
		if (result.errors.length > 0) {
			console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s errors\x1B[0m', result.errors.length);
			for (const item of result.errors) {
				console.error(item);
			}
			return 1;
		}

		if (process.stdout.isTTY) {
			console.log(
				'\x1B[48;5;10m\x1B[K✅  Generate Complete, %s success %s unchanged.\x1B[0m',
				result.success,
				result.skip,
			);
		}
		return 0;
	} catch (e: any) {
		console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s\x1B[0m', e.message);
		return 1;
	}
}

main().then((code) => {
	process.exit(code);
});
