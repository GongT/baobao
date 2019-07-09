#!/usr/bin/env node

require('./_loader').init();
module.exports = require(__dirname + '/lib/api.js').loadToGulp;
