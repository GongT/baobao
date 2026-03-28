import { dirname } from 'node:path';

const filenameRegex = /\b__filename\b|\bimport.meta.filename\b/g;
const dirnameRegex = /\b__dirname\b|\bimport.meta.dirname\b/g;
const urlRegex = /\bimport.meta.url\b/g;

export function replaceConstant(code: string, fileUrl: string) {
	const filePath = fileUrl.slice(7); // remove "file://"
	return code
		.replace(filenameRegex, JSON.stringify(fileUrl))
		.replace(dirnameRegex, JSON.stringify(dirname(filePath)))
		.replace(urlRegex, JSON.stringify(filePath));
}
