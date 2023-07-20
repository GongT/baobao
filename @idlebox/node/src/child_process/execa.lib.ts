const cjs = typeof require !== 'undefined';
if (cjs) {
	require('@gongt/fix-esm').register();
}

import { execaSync } from 'execa';

if (cjs) {
	require('@gongt/fix-esm').unregister();
}

export const execaSyncLibrary = execaSync;
