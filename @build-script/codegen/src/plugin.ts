export type { FileBuilder, WrappedArray } from './client/file-builder.js';
export type { GenerateContext } from './client/generate-context.js';
export { Logger, type ILogger } from './common/output.js';

import type { ILogger } from './common/output.js';

declare global {
	const logger: ILogger;
}
