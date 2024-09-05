import '@gongt/register-tslib';
import type { IHeftLifecyclePlugin } from '@rushstack/heft';
import { install } from 'source-map-support';

Error.stackTraceLimit = Infinity;

if (process.argv.includes('--debug')) {
	install();
}

export default class SourceMapSupportPlugin implements IHeftLifecyclePlugin {
	apply(): void {}
}
