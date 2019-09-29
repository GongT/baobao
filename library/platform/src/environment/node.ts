import { PlatformPathArray } from './platformPathArray';

export const nodeProcessEnv: PlatformPathArray = null as any;
Object.defineProperty(module.exports, 'nodeProcessEnv', {
	get() {
		delete module.exports.nodeProcessEnv;
		module.exports.nodeProcessEnv = new PlatformPathArray('Path');
	},
});
