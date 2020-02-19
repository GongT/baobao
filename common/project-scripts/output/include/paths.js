"use strict";
exports.__esModule = true;
var rush_tools_1 = require("@idlebox/rush-tools");
var path_1 = require("path");
exports.REPO_ROOT = rush_tools_1.findRushRootPathSync(__dirname);
exports.TEMP_DIR = path_1.resolve(exports.REPO_ROOT, 'common/temp');
exports.NPM_BIN = path_1.resolve(exports.TEMP_DIR, 'pnpm-local/node_modules/.bin/pnpm');
