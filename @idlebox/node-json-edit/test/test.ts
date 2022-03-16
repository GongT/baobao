import { existsSync, mkdirSync, unlink } from 'fs';
import { dirname, resolve } from 'path';
import {
	insertKeyAlphabet,
	loadJsonFile,
	parseJsonText,
	reformatJson,
	writeJsonFile,
	writeJsonFileBack,
	writeJsonFileBackForce,
} from '../src/index';

process.chdir(dirname(__dirname));
if (!existsSync('test')) {
	mkdirSync('test');
}
process.chdir('test');

function testFs(...f: string[]) {
	return resolve(__dirname, '../../../test', ...f);
}
function resultFs(f: string) {
	return testFs('results', f);
}

(async () => {
	const data = await loadJsonFile(testFs('tsconfig.json'));
	await reformatJson(data, { lastNewLine: false });
	await writeJsonFile(resultFs('test-no-newline.json'), data); // no last line

	const data2 = await loadJsonFile(resultFs('test-no-newline.json'));
	await reformatJson(data2, { printWidth: 10 });
	await writeJsonFile(resultFs('test-reformat.json'), data2); // arrays will wrap

	const data3 = parseJsonText(`{
		"a":1,
		/* comment of c */
		"c":1
	}`);
	insertKeyAlphabet(data3, 'b', 2);
	await writeJsonFile(resultFs('test-insert.json'), data3); // will be {a:1,b:2,c:1}

	const data4 = parseJsonText('{"i":1}');
	await writeJsonFile(resultFs('test-back.json'), data4); // will be {i: 2}

	const data4t = await loadJsonFile(resultFs('test-back.json'));
	data4t.i += 1;
	await writeJsonFileBack(data4t); // will be {i: 2}

	const data5 = parseJsonText('{"q":1}');
	await writeJsonFile(resultFs('test-changed.json'), data5);
	await new Promise<void>((resolve, reject) => {
		const wrappedCallback = (err: Error | null) => (err ? reject(err) : resolve());
		unlink(resultFs('test-changed.json'), wrappedCallback);
	});
	await writeJsonFileBack(data5); // targe file will not exists

	const myPackage = await loadJsonFile(testFs('../package.json'));
	await writeJsonFileBackForce(myPackage);
})().catch((e) => {
	console.error(e.stack);
	process.exit(1);
});
