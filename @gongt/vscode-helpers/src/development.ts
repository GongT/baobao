import { loadJsonFileSync, writeJsonFileBackSync } from '@idlebox/node-json-edit';
import { IActionConstructor } from './action';
import { context, wrapId, IdCategory } from './context';
import { IPackageJson } from './packagejson';

let pkgJson: IPackageJson;

function load() {
	if (!pkgJson) {
		pkgJson = loadJsonFileSync(context.asAbsolutePath('package.json'));

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
	writeJsonFileBackSync(pkgJson);
}
