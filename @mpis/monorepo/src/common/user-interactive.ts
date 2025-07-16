import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import type { IPnpmMonoRepo } from './workspace.js';

export async function startUi(_repo: IPnpmMonoRepo) {
	registerGlobalLifecycle(
		toDisposable(async () => {
			logger.error`Exiting...`;
		}),
	);
}
