import { isNodeJs } from '../platform/os.js';

type ITaskScheduler = (task: Function) => void;

declare const process: any;
declare const queueMicrotask: any;

export const scheduler: ITaskScheduler = isNodeJs ? process.nextTick : (queueMicrotask ?? setTimeout);
