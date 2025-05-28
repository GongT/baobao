import type { ILogger as ITSALogger } from '@idlebox/typescript-surface-analyzer';

export type ILogger = Omit<ITSALogger, 'verbose'>;
