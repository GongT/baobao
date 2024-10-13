import { wrapConsoleLogger, findUpUntilSync } from '@build-script/heft-plugin-base';
import { globSync } from 'glob';
import { resolve } from 'path';
import { run } from './share';

const p = process.argv[2];
if (!p) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

const root = resolve(process.cwd(), p);

const files = globSync('**/*.generator.{ts,js}', { ignore: ['node_modules/**'], cwd: root, absolute: true });

class Opt {
	public readonly logger = wrapConsoleLogger();
	private _root: string | null = null;
	get root() {
		if (!this._root) {
			this._root = findUpUntilSync(root, 'package.json');
			if (!this._root) {
				throw new Error('failed find package.json from ' + root);
			}
		}
		return this._root;
	}
}

(async () => {
	try {
		const result = await run(files, new Opt());
		if (result.errors.length > 0) {
			console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s errors\x1B[0m', result.errors.length);
			for (const item of result.errors) {
				console.error(item.message);
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
})().then((code) => {
	setTimeout(() => {
		process.exit(code);
	}, 0);
});
