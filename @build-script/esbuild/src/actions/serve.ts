import { resolve } from 'path';
import { oneDay } from '@idlebox/common';
import express from 'express';
import morgan from 'morgan';
import { waitComplete } from '../library/wait';
import { outputDir, projectRoot } from '../build/library/constants';

function createApplication() {
	const app = express();
	app.set('etag', 'strong');

	const index = resolve(outputDir, 'index.html');

	morgan.token('color_status', function getId(_req, res) {
		const s = res.statusCode ? res.statusCode.toFixed(0) : ' - ';
		if (res.statusCode === 200 || res.statusCode === 304) {
			return `\x1B[38;5;10m${s}`;
		} else if (res.statusCode < 400) {
			return `\x1B[38;5;11m${s}`;
		} else {
			return `\x1B[38;5;9m${s}`;
		}
	});
	app.use(morgan(':color_status :method :url\x1B[0m'));

	const assets = express.Router();
	assets.use('/@src', express.static(projectRoot, { maxAge: 0 }));
	assets.use(/\.map$/, express.static(outputDir, { maxAge: 0 }));
	assets.use(
		express.static(outputDir, {
			immutable: true,
			fallthrough: false,
			index: false,
			etag: true,
			maxAge: oneDay * 365,
		})
	);
	app.use('/_assets', assets);

	app.use((_req, res) => {
		res.sendFile(index);
	});

	return app;
}

export function startServe() {
	return waitComplete()
		.then(createApplication)
		.then((app) => {
			app.listen(30280, '0.0.0.0', notifyOk);
		});
}

function notifyOk() {
	console.log('\n\n\x1B[38;5;10m    Debug Server Started: \x1B[0m');
	console.log('        local address: http://127.0.0.1:30280');
}
