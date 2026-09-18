import { createRootLogger } from '@idlebox/logger';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createWrapperScript } from '../create-wrap-script.js';
import { createWorkspace } from '@build-script/monorepo-lib';

createRootLogger('test');

const assets = resolve(import.meta.dirname, 'assets');
const test_outs = resolve(import.meta.dirname, '.test');
const ws = await createWorkspace(import.meta.dirname);

for (const name of await readdir(assets)) {
	const base = name.split('.')[0];

	await createWrapperScript({
		targetFile: resolve(assets, name),
		wrapperFile: resolve(test_outs, 'pwsh', base),
		workspace: ws,
		type: 'powershell',
	});

	await createWrapperScript({
		targetFile: resolve(assets, name),
		wrapperFile: resolve(test_outs, 'bash', base),
		workspace: ws,
		type: 'bash',
	});
}

// await createWrapperScript({
// 	targetFile: resolve(assets, 'exec-python.py'),
// 	wrapperPath: resolve(test_outs, 'exec-python'),
// 	workspace: ws,
// });
