#!/usr/bin/env node

require('source-map-support/register');
require('./lib/index').default().then(() => {
}, (e) => {
	setImmediate(() => {
		throw e;
	});
});
