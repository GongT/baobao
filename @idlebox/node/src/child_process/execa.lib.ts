const cjs = typeof require !== 'undefined';
if (cjs) {
	require('fix-esm').register();
}

import { execaSync } from 'execa';

if (cjs) {
	require('fix-esm').unregister();
}

export const execaSyncLibrary = execaSync;
