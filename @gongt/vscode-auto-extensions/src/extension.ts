import { context, filesystem, logger, vscodeExtensionActivate, vscodeExtensionDeactivate } from '@gongt/vscode-helpers';
import { GetFnType, withDatabase } from '@gongt/vscode-sqlite3-bridge';
import { arrayDiff, sleep } from '@idlebox/common';
import { promisify } from 'util';
import { env, extensions, workspace } from 'vscode';
import { api } from './api/createApi';
import { checkWhichExtensionShouldEnable } from './inc/checkWhichExtensionShouldEnable';
import { alertError } from './inc/error';

const self = extensions.getExtension('gongt.vscode-auto-extensions')!;
Object.assign(global, {
	vscode_1: require('vscode'),
	vscode_helpers_1: require('@gongt/vscode-helpers'),
	self,
	_extensionService: (self as any)._extensionService,
});

interface Data {
	id: string;
	uuid: string;
}

// workbench.extensions.action.disableAll;

async function dumpCurrent() {
	const current = extensions.all.filter(({ isActive }) => isActive).map(({ id }) => id);
	logger.debug('Dump Current (%s) ============= %s', current.length, new Date());
	for (const item of current) {
		logger.debug(` * ${item}`);
	}
}

async function main() {
	const willEnable = await checkWhichExtensionShouldEnable();
	const current = extensions.all.filter(({ isActive }) => isActive).map(({ id }) => id);

	const diff = arrayDiff(current, [...willEnable]);

	logger.debug('Match:');
	for (const item of diff.same) {
		logger.debug(` * ${item}`);
	}
	if (diff.del.length === 0 && diff.add.length === 0) {
		logger.info('Good, all extension match requirement!');
		return;
	}
	logger.debug('Add:');
	for (const item of diff.add) {
		logger.debug(` * ${item}`);
	}
	logger.debug('Remove:');
	for (const item of diff.del) {
		logger.debug(` * ${item}`);
	}

	const db = filesystem.privateFile('../state.vscdb').path.fsPath;
	await withDatabase(db, async (client) => {
		const get = promisify(client.get.bind(client));
		const getResult: any = await get(`SELECT value FROM ItemTable WHERE key="extensionsIdentifiers/disabled";`);
		let result: Data[];
		try {
			logger.debug('  -> %s', getResult.value);
			result = JSON.parse(getResult.value);
			if (!Array.isArray(result)) {
				result = [];
			}
		} catch {
			result = [];
		}

		let change = false;
		for (const item of diff.del) {
			const ext = extensions.getExtension(item)!;
			const nuuid = ext.packageJSON.uuid;
			const nid = ext.id;

			const exists = result.find(({ uuid, id }) => id === nid || nuuid === uuid);
			if (exists) {
				if (exists.id !== nid) {
					exists.id = nid;
					change = true;
				}
				if (exists.uuid !== nuuid) {
					exists.uuid = nuuid;
					change = true;
				}
			} else {
				result.push({ id: nid, uuid: nuuid });
				change = true;
			}
		}

		if (!change) {
			logger.info('Did not change.');
			return;
		}

		// todo: extensionsIdentifiers/enabled
		const run = promisify((client.run as GetFnType).bind(client));
		if (getResult) {
			logger.info('Update.');
			await run(`UPDATE ItemTable SET value = $value WHERE key="extensionsIdentifiers/disabled";`, {
				$value: JSON.stringify(result),
			});
		} else {
			logger.info('Insert.');
			await run(`INSERT INTO ItemTable (key, value) VALUES ("extensionsIdentifiers/disabled", $value);`, {
				$value: JSON.stringify(result),
			});
		}
		logger.debug('  -> %s', JSON.stringify(result));
	});

	// todo: install these
	for (const item of diff.add) {
	}

	logger.log('Done!');
}

export const activate = vscodeExtensionActivate(async function activate() {
	if (!context.storageUri) {
		logger.error('context.storageUri is undefined!');
		return false;
	}

	if (env.remoteName) {
		logger.info('storageUri=', context.storageUri.toString());
		logger.info('running remote mode, wait for command...');

		const f = filesystem.privateFile('test1.txt');
		await f.writeText('wow such doge');
		logger.log('TEST1: %j', f);

		return api;
	}

	let firstTrigger = false;

	context.subscriptions.push(
		workspace.onDidChangeWorkspaceFolders(async () => {
			if (!firstTrigger) {
				return;
			}
			main().catch((e) => {
				alertError('Failed run auto extension', e);
			});
		})
	);

	logger.debug('sleep 10s');
	await sleep(10000);

	await main();
	firstTrigger = true;

	return api;
});

export const deactivate = vscodeExtensionDeactivate(function deactivate() {
	logger.log('deactivate');
});
