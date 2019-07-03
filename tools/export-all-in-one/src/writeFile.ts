import { existsSync, readFileSync, writeFileSync } from 'fs';

export function writeFileSyncIfChange(file: string, data: string) {
	if (existsSync(file) && readFileSync(file, 'utf8') === data) {
		// console.log('%s -> no change', relative(PROJECT_ROOT, file));
		return;
	}

	writeFileSync(file, data, 'utf8');
}

export interface MyJsonData {
	___tabs: string;
	___lastNewLine: string;
}

export function writeJsonSyncIfChange(file: string, data: MyJsonData & any) {
	const { ___tabs, ___lastNewLine, ...object } = data;
	const packageData = JSON.stringify(object, null, 1).replace(/^\s+/mg, (m0: string) => {
		return new Array(m0.length).fill(___tabs).join('');
	}) + ___lastNewLine;
	writeFileSyncIfChange(file, packageData);
}

export function readJsonSync<T>(file: string): T & MyJsonData {
	const jsonString = readFileSync(file, 'utf8');

	const findSpace = /^\s+/m.exec(jsonString);
	const ___tabs = findSpace ? findSpace[0] : '  ';
	const ___lastNewLine = jsonString.slice(jsonString.lastIndexOf('}') + 1);

	return Object.assign(JSON.parse(jsonString) as T, {
		___tabs,
		___lastNewLine,
	});
}