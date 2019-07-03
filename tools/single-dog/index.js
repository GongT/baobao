#!/usr/bin/env node
require('source-map-support/register');
global.CONTENT_ROOT = process.cwd();
global.TEMPLATE_ROOT = __dirname + '/package';
require('./lib/index.js');
