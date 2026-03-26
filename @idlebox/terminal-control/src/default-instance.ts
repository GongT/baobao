import { registerGlobalLifecycle } from '@idlebox/common';
import { Terminal } from './api.js';

export const terminal = new Terminal(process.stderr, process.stdin);
registerGlobalLifecycle(terminal, true);

export * from './api.js';
