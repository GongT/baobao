#!/usr/bin/env node
require('source-map-support/register');

const fs = require('fs');
const path = require('path');

Error.stackTraceLimit = Infinity;
require(`./lib/index.js`).default().catch(require('@idlebox/errors').prettyPrintError.bind(undefined, 'unpm'));
