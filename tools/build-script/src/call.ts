import { resolve } from 'path';
import { buildSequence } from 'inc/normalizeSequence';

export default async function callScript() {
	const argv = process.argv.slice(2);
	const command = argv.find(item => !item.startsWith('-'));

	if (!command) {
		throw new Error('Must set an action to run');
	}

	const buildConfig = await load();
	for (const plugin of buildConfig.plugins) {
		await loadPlugin(buildConfig, plugin);
	}
	const actionDefine = buildConfig.actions[command];

	if (!actionDefine || !actionDefine.exported) {
		throw new Error('No such action: ' + command);
	}

	const sequence: any[] = buildSequence(actionDefine.type, actionDefine.sequence);
}

function load() {
	return require(resolve(PROJECT_ROOT, 'build-script.json'));
}

function loadPlugin(buildConfig: any, plugin: string) {
	return require(plugin).default(buildConfig);
}
