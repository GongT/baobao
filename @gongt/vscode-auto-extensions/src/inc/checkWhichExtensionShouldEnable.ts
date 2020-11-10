import { filesystem, logger } from '@gongt/vscode-helpers';
import { extensions, workspace, WorkspaceFolder } from 'vscode';
import { alertError } from './error';

export async function checkWhichExtensionShouldEnable(): Promise<Set<string>> {
	const config = workspace.getConfiguration('extensions.automatic');

	const configFile = config.get<string>('alternativeConfig', '.vscode/extensions.json');
	const alwaysEnable = config.get<string[]>('alwaysEnable', []);

	const tobeEnabled = new Set<string>(alwaysEnable);
	for (const { id, isActive, packageJSON } of extensions.all) {
		if (!isActive) {
			continue;
		}
		if (packageJSON.isUserBuiltin || packageJSON.isBuiltin || packageJSON.isUnderDevelopment) {
			tobeEnabled.add(id);
		}
		if (id.startsWith('ms-vscode-remote.')) {
			tobeEnabled.add(id);
		}
		for (const exCate of ['themes', 'language packs', 'keymaps']) {
			if (packageJSON.categories?.map((e: string) => e.toLowerCase()).includes(exCate)) {
				tobeEnabled.add(id);
			}
		}
	}

	logger.info('Reload status...');
	if (workspace.workspaceFolders) {
		logger.info('%s folders', workspace.workspaceFolders.length);

		for (const workspaceFolder of workspace.workspaceFolders) {
			logger.debug(' * %s', workspaceFolder.uri.path);

			const { recommendations, unwantedRecommendations } = await loadJsonIfExists(workspaceFolder, configFile);

			if (unwantedRecommendations) {
				for (const item of unwantedRecommendations) {
					tobeEnabled.delete(item);
				}
			}
			if (recommendations) {
				for (const item of recommendations) {
					tobeEnabled.add(item);
				}
			}
		}
	} else {
		logger.info('startup: no folder opened');
	}

	tobeEnabled.add('gongt.vscode-auto-extensions');

	return tobeEnabled;
}

async function loadJsonIfExists(workspaceFolder: WorkspaceFolder, fileName: string): Promise<any> {
	const file = filesystem.workspaceFile(workspaceFolder, fileName);
	if (!(await file.isFileExists())) {
		return {};
	}

	try {
		const json = await file.readJson(true);
		return json || {};
	} catch (e) {
		alertError('Failed load ' + file.toString(), e);
		return {};
	}
}
