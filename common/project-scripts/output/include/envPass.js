"use strict";
exports.__esModule = true;
var paths_1 = require("./paths");
var path_1 = require("path");
var fs_1 = require("fs");
var envFile = path_1.resolve(paths_1.TEMP_DIR, 'run-env.json');
function writeEnv() {
    fs_1.writeFileSync(envFile, JSON.stringify(process.env));
}
exports.writeEnv = writeEnv;
function loadEnv() {
    if (process.env.LOAD_ENV_FILE) {
        delete process.env.LOAD_ENV_FILE;
        var envs = require(envFile);
        for (var _i = 0, _a = Object.entries(envs); _i < _a.length; _i++) {
            var _b = _a[_i], k = _b[0], v = _b[1];
            process.env[k] = v;
        }
    }
}
exports.loadEnv = loadEnv;
