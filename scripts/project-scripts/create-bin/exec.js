import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function exec(file) {
	const r = spawnSync(
		process.argv[0],
		['--no-warnings', '--loader', __filename, path.resolve(__dirname, file), ...process.argv.slice(2)],
		{ stdio: 'inherit' },
	);
	if (r.signal) {
		console.error('killed by', r.signal);
		process.exit(1);
	} else {
		process.exit(r.code);
	}
}

const knownEsm = ['source-map-support/register'];

export function resolve(specifier, context, nextResolve) {
	// console.error('resolve: ', specifier, context);
	if (
		specifier.startsWith('./') ||
		specifier.startsWith('../') ||
		specifier.startsWith('file://') ||
		knownEsm.includes(specifier)
	) {
		if (!(specifier.endsWith('.js') || specifier.endsWith('.mjs') || specifier.endsWith('.cjs'))) {
			const newSpecifier = specifier + '.js';
			return nextResolve(newSpecifier, context);
		}
	}
	return nextResolve(specifier, context);
}
