export * from './lib/index';

import type { IGlobalSession } from './lib/common/type';

declare global {
	var session: IGlobalSession;
}
