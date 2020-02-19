"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var child_process_1 = require("child_process");
var command_exists_1 = require("command-exists");
var fs_extra_1 = require("fs-extra");
var os_1 = require("os");
var path_1 = require("path");
var envPass_1 = require("./envPass");
var paths_1 = require("./paths");
exports.doSpawn = os_1.platform() == 'linux' && command_exists_1.sync('systemd-run') ? spawnSystemd : spawnNormal;
function getFile(file) {
    file = path_1.resolve(__dirname, '../actions/', file);
    if (!fs_extra_1.existsSync(file)) {
        throw new Error('Can not spawn file: ' + file);
    }
    return file;
}
function nodejsArguments(file, args) {
    return __spreadArrays(['-r', 'source-map-support/register', file], args);
}
function spawnNormal(file, args) {
    if (args === void 0) { args = []; }
    file = getFile(file);
    console.log('Using spawn without systemd.');
    execv(process.argv0, nodejsArguments(file, args));
}
function spawnSystemd(file, args) {
    if (args === void 0) { args = []; }
    var isAlreadyQuit = false;
    file = getFile(file);
    console.log('Using systemd-run on linux.');
    var uid = os_1.userInfo().uid;
    var unitName = path_1.basename(file, '.js') + ".service";
    var cmds = ['--quiet', '--wait', '--collect', '--pty', '--same-dir', "--unit=" + unitName];
    if (uid > 0) {
        cmds.push('--user');
    }
    function handleSystemQuit(e) {
        console.error('handle exit...', e);
        var stop = [];
        if (uid > 0) {
            stop.push('--user');
        }
        stop.push(isAlreadyQuit ? 'kill' : 'stop', unitName);
        isAlreadyQuit = true;
        spawnQuit('systemctl', stop);
    }
    envPass_1.writeEnv();
    cmds.push("--setenv=LOAD_ENV_FILE=yes");
    cmds.push.apply(cmds, __spreadArrays([process.argv0], nodejsArguments(file, args)));
    process.on('SIGINT', handleSystemQuit);
    process.on('beforeExit', handleSystemQuit);
    execv('systemd-run', cmds);
}
function execv(cmd, argv) {
    console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
    var r = child_process_1.spawn(cmd, argv, {
        stdio: 'inherit',
        shell: false,
        cwd: paths_1.TEMP_DIR
    });
    r.on('error', function (error) {
        console.error('\x1B[35;5;9m - %s can not start, %s\x1B[0m', cmd, error.message);
        setImmediate(function () {
            throw error;
        });
    });
    r.on('exit', function (code, signal) {
        console.error('\x1B[2m - %s finished with code %s, signal %s\x1B[0m', cmd, code, signal);
        if (code !== 0)
            process.exit(code);
        if (signal)
            process.kill(process.pid, signal);
        process.exit(0);
    });
}
function spawnQuit(cmd, argv) {
    console.error('\x1B[2m + %s %s\x1B[0m', cmd, argv.join(' '));
    var r = child_process_1.spawn(cmd, argv, {
        stdio: 'inherit',
        shell: false,
        cwd: paths_1.TEMP_DIR
    });
    r.on('error', function (error) {
        console.error('\x1B[35;5;9m - can not stop, %s\x1B[0m', error.message);
    });
    r.on('exit', function (code, signal) {
        console.error('\x1B[2m - stop: code %s, signal %s\x1B[0m', cmd, code, signal);
    });
}
