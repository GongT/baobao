import { Emitter } from '@idlebox/common';
import { FSWatcher } from 'chokidar';
import { writeFile } from 'fs/promises';
import { basename, resolve } from 'path';
import { compileAsync } from 'sass';
import { hash } from './esbuild/library.js';
import { entrySourceRoot, isTTY, outputDir } from './library/constants.js';
import { rush } from './library/rush.js';

async function compile(f: string) {
	try {
		const res = await compileAsync(f, {
			alertColor: isTTY,
			charset: false,
			loadPaths: [entrySourceRoot],
			sourceMap: true,
			style: 'expanded',
			sourceMapIncludeSources: true,
		});

		const name = basename(f).replace(/\.scss$/, '-' + hash(res.css) + '.css');
		const file = resolve(outputDir, name);
		await writeFile(file, res.css, 'utf-8');
		await writeFile(file + '.map', JSON.stringify(res.sourceMap), 'utf-8');

		return name;
	} catch (e: any) {
		throw new Error(`${e.message}\n  file: ${f}`);
	}
}

function build(file: string) {
	return compile(file).then(
		(f) => {
			const id = basename(file, '.scss');
			(styles as any)[id] = f;
			mayFire();
		},
		(e) => {
			event.fireNoError(e);
		},
	);
}

interface IStyles {
	preload: string;
	index: string;
}
const styles: IStyles = { preload: '', index: '' };
const event = new Emitter<IStyles | Error>();

function mayFire() {
	if (styles.preload && styles.index) {
		event.fire(styles);
	}
}

export function compileScss(watchMode: boolean) {
	const mainScss = rush.absolute('@moffett/style', 'index.scss');
	const preloadScss = resolve(entrySourceRoot, 'preload.scss');

	if (watchMode) {
		const watchers = new FSWatcher({});

		watchers.add(mainScss);
		watchers.add(preloadScss);

		watchers.on('change', (f) => {
			console.log('[scss] change detect: %s', f);

			build(f);
		});
	}

	build(mainScss);
	build(preloadScss);

	return event.register;
}
