import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

for (const [key, value] of Object.entries(pkg.exports)) {
	if (key.endsWith('.json')) continue;
	if (typeof value !== 'string') continue;

	pkg.exports[key] = value.replace(/\.ts$/, '.js').replace('src/', 'lib/');
}

writeFileSync('package.json', JSON.stringify(pkg, null, 2), 'utf8');
appendFileSync('.npmignore', 'scripts/\n');
