import { findMonorepoRoot } from './api.js';

const r = await findMonorepoRoot(process.cwd());

if (r) {
	console.log(`found monorepo root: ${r}`);
} else {
	console.log('no monorepo root found');
}
