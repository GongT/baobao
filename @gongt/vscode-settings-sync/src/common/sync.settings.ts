import { logger } from '@gongt/vscode-helpers';
import { isArraySame, isObjectSameRecursive } from '@idlebox/helpers';
import { workspace } from 'vscode';
import { MyState } from './state';

export async function createSettingSnapshot(state: MyState) {
	const fullConfig = workspace.getConfiguration();
	const allKeys = flatObjectKeys(fullConfig);
	// console.log(allKeys);

	let counter = 0;

	for (const key of allKeys) {
		const data = fullConfig.inspect(key);
		let change = false;

		if (!data) continue;

		if (isSettingChange(data)) {
			change = await state.writeSetting(key, data.globalValue);
		} else {
			change = await state.unsetSetting(key);
		}
		/*if (data?.languageIds?.length) {
			for (const languageId of data.languageIds) {
				output[`[${languageId}] ${key}`] = workspace
					.getConfiguration('', { languageId })
					.inspect(key)?.globalLanguageValue;
			}
		}*/

		if (change) counter++;
	}

	logger.info('  %d setting(s) change.', counter);
}

const validKey = /^[\[\]$a-z0-9_.-]+$/i;

function flatObjectKeys(object: { [id: string]: any }, path: string = '') {
	const result: string[] = [];
	for (const [key, value] of Object.entries(object)) {
		if (!validKey.test(key)) {
			console.log('invalid key, is object: %s::%s:', path, key);
			return [path];
		}
		const kpath = path ? path + '.' + key : key;
		if (typeof value === 'function') continue;

		if (value && typeof value === 'object') {
			if (Array.isArray(value)) {
				result.push(kpath);
			} else {
				result.push(...flatObjectKeys(value, kpath));
			}
		} else {
			result.push(kpath);
		}
	}
	return result;
}

function isSettingChange({ defaultValue, globalValue }: any) {
	if (globalValue === undefined) {
		return false;
	}
	if (defaultValue === globalValue) {
		return false;
	}
	if (typeof defaultValue !== typeof globalValue) {
		return true;
	}
	if (!!defaultValue !== !!globalValue) {
		return true;
	}

	if (Array.isArray(defaultValue) !== Array.isArray(globalValue)) {
		return true;
	}
	if (Array.isArray(defaultValue)) {
		return !isArraySame(defaultValue, globalValue);
	}
	if (defaultValue && typeof defaultValue === 'object') {
		return !isObjectSameRecursive(defaultValue, globalValue);
	}
	return true;
}
