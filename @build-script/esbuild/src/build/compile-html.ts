import { resolve } from 'path';
import { readFile, writeFile } from 'fs-extra';
import { entrySourceRoot, outputDir } from './library/constants';

export async function generateIndexHtml(params: Record<string, string>) {
	const src = resolve(entrySourceRoot, 'index.html');
	let content = await readFile(src, 'utf-8');

	for (const [from, to] of Object.entries(params)) {
		content = content.replace(from, '/_assets/' + to);
	}

	const dist = resolve(outputDir, 'index.html');
	await writeFile(dist, content, 'utf-8');
}
