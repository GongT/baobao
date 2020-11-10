import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { IActionConstructor } from './action';
import { context, IdCategory, wrapId } from './context';
import { logger } from './logger.ipc';
import { IPackageJson } from './packagejson';

let pkgJson: IPackageJson;

function load() {
	if (!pkgJson) {
		const selfPkg = context.asAbsolutePath('package.json');
		logger.info(selfPkg);
		pkgJson = loadJsonFileSync(selfPkg);

		if (!pkgJson.contributes) {
			pkgJson.contributes = {};
		}
		pkgJson.contributes.commands = [];
	}
}

/** @internal */
export function upgradePackageContributeAction({ id, label, category, icon }: IActionConstructor<any>) {
	load();

	const fullId = wrapId(IdCategory.Action, id);

	pkgJson.contributes!.commands!.push({
		command: fullId,
		title: label,
		category,
		icon,
	});
}

/** @internal */
export function developmentFlushPackage() {
	if (pkgJson) {
		const found = pkgJson?.contributes?.keybindings?.find?.(({ command, key }) => {
			return command === 'workbench.action.reloadWindow' || key.toLowerCase() === 'f5';
		});
		if (!found) {
			if (!pkgJson.contributes) {
				pkgJson.contributes = {};
			}
			if (!pkgJson.contributes.keybindings) {
				pkgJson.contributes.keybindings = [];
			}
			pkgJson.contributes.keybindings.push({
				command: 'workbench.action.reloadWindow',
				key: 'F5',
			});
		}

		logger.warn('rewrite package.json.');
		writeJsonFileBackSync(pkgJson);
	}
}
