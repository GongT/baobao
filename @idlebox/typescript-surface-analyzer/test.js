#!/usr/bin/env node

process.env.NODE_DEBUG = 'EXPORT';
require('source-map-support/register');
require('./lib/test.js');
