import { EventEmitter } from 'events';
import Gulp from 'gulp';
import { forceGetContext, getBuildContext, getCurrentDir, setCurrentDir } from '../common/buildContextInstance';
import { load } from '../common/gulp';
import { currentArgs, currentPlugin } from './ctsStore';
import { fancyLog } from '../common/fancyLog';

export const buildContext: any = new Proxy({} as any, {
	get(_: any, p: string | number | symbol): any {
		if (currentPlugin) {
			if (p === 'args') {
				return currentArgs;
			} else {
				return forceGetContext()[p];
			}
		} else {
			throw new Error(`Can't use buildContext now. Only available first event loop, no async.`);
		}
	},
});

export function setProjectDir(dir: string) {
	setCurrentDir(dir);
}

export function getProjectDir() {
	return getCurrentDir();
}

export async function registerPlugin(name: string, args: string[]): Promise<void> {
	const v = getBuildContext();
	if (!v.isProjectJsonExists()) {
		throw new Error('build-script not init in current project');
	}
	v.pushPlugin(name, args);
	await v.writeBack();
}

export async function addBuildStep(name: string, build: string[], watch: string[]) {
	const v = getBuildContext();
	if (!v.isProjectJsonExists()) {
		throw new Error('build-script not init in current project');
	}
	if (!v.projectJson.alias.has(`watch-${name}`)) {
		v.registerAlias(`watch-${name}`, watch[0], watch.slice(1));
	}
	v.addAction('watch', [`watch-${name}`]);
	if (!v.projectJson.alias.has(`build-${name}`)) {
		v.registerAlias(`build-${name}`, build[0], build.slice(1));
	}
	v.addAction('build', [`build-${name}`]);
	await v.writeBack();
}

export async function getPlugin(name: string) {
	const v = getBuildContext();
	if (!v.isProjectJsonExists()) {
		throw new Error('build-script not init in current project');
	}
	return v.getPlugin(name);
}

export function loadToGulp(gulp: typeof Gulp, __dirname: string) {
	// console.error('load to gulp')
	require('source-map-support/register');
	setImmediate(() => {
		if ((gulp as EventEmitter).listenerCount('error') === 0) {
			gulp.on('error', () => {
				fancyLog.error('[BuildScript] Build failed...');
			});
		}
	});
	return load(gulp, __dirname);
}

export function isBuildConfigFileExists() {
	const v = getBuildContext();
	return v.isProjectJsonExists();
}
