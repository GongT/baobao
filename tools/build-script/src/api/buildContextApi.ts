import { buildConfig } from './load';
import { IBuildScriptJson } from './types';

function getCurrentConfig(): IBuildScriptJson {
	if (!buildConfig) {
		throw new Error('Not in build script context.');
	}
	return buildConfig;
}

function getOrCreateAction(action: string) {
	const config = getCurrentConfig();
	if (!config.actions[action]) {
		config.actions[action] = { type: 'serial', exported: false, sequence: [] };
	}
	return config.actions[action];
}

export default {
	registerJob(name: string, command: string, args: string[] = []) {
		const config = getCurrentConfig();
		if (config.jobs[name]) {
			throw new Error('job exists: ' + name);
		}
		config.jobs[name] = [command, ...args];
	},
	prependActionStep(action: string, job: string) {
		getOrCreateAction(action).sequence.unshift(job);
	},
	appendActionStep(action: string, job: string) {
		getOrCreateAction(action).sequence.push(job);
	},
	prefixAction(action: string, job: string) {
		this.prependActionStep(action, '@pre' + action);
		this.appendActionStep('pre' + action, job);
	},
	postfixAction(action: string, job: string) {
		this.appendActionStep(action, '@post' + action);
		this.appendActionStep('post' + action, job);
	},
};
