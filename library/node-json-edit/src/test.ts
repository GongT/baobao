import { existsSync, mkdirSync } from 'fs';
import { unlink } from 'fs-extra';
import { dirname } from 'path';
import 'source-map-support';
import { insertKeyAlphabet, LineFeed, loadJsonFile, parseJsonText, reformatJson, writeJsonFile, writeJsonFileBack } from './index';

process.chdir(dirname(__dirname));
if (!existsSync('test')) {
	mkdirSync('test');
}
process.chdir('test');
(async () => {
	const data = await loadJsonFile('../package.json');
	await reformatJson(data, { tabs: '  ', lastNewLine: false, lineFeed: LineFeed.NONE });
	await writeJsonFile('./test-rw.json', data);

	const data2 = await loadJsonFile('./test-rw.json');
	await reformatJson(data2, { lineFeed: LineFeed.CRLF });
	await writeJsonFile('./test-reformat.json', data2);

	const data3 = parseJsonText('{"a":1,"c":1}');
	insertKeyAlphabet(data3, 'b', 2);
	await writeJsonFile('./test-insert.json', data3);

	const data4 = parseJsonText('{"i":1}');
	await writeJsonFile('./test-back.json', data4);

	const data4t = await loadJsonFile('./test-back.json');
	data4t.i += 1;
	await writeJsonFileBack(data4t);

	const data5 = parseJsonText('{"i":1}');
	await writeJsonFile('./test-changed.json', data5);
	await unlink('./test-changed.json');
	await writeJsonFileBack(data5);

})().catch((e) => {
	setImmediate(() => {
		throw e;
	});
});
