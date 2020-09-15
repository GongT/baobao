import { info } from 'fancy-log';
import { writeFile as writeFileAsync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import { renderToStaticMarkup } from 'react-dom/server';
import { createDict } from './createDict';
import { createDocument } from './createDocument';
import { htmlPage } from './htmlPageHeader';
import { ITable } from '../fetch/type';
// @ts-ignore
import pretty from 'pretty';

const writeFile = promisify(writeFileAsync);

/** @internal */
export async function generateDocuments(outDir: string, tables: ITable[]) {
	const dictFile = resolve(outDir, 'data-dict.html');
	info('渲染到文件: %s', dictFile);
	await writeFile(
		dictFile,
		pretty('<!DOCTYPE html>' + renderToStaticMarkup(htmlPage('数据字典', createDict(tables))), { ocd: true })
	);

	const documentFile = resolve(outDir, 'database.html');
	info('渲染到文件: %s', documentFile);
	await writeFile(
		documentFile,
		pretty('<!DOCTYPE html>' + renderToStaticMarkup(htmlPage('数据库结构', createDocument(tables))), { ocd: true })
	);
}
