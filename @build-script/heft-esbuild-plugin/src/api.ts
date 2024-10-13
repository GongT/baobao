import type { IGlobalSession } from './common/type.js';
export type { OutputFile } from './common/write.helper.js';

declare global {
	var session: IGlobalSession;
}
