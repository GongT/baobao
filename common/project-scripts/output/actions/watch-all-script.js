"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var rush_tools_1 = require("@idlebox/rush-tools");
var child_process_1 = require("child_process");
var path_1 = require("path");
var paths_1 = require("../include/paths");
var envPass_1 = require("../include/envPass");
var split2 = require("split2");
envPass_1.loadEnv();
// TODO: support other compile type
var clearSeq = /\x1Bc/g;
var compileComplete = /Found 0 errors\. Watching for file changes\./;
var compileError = /Found [0-9]+ errors?\. Watching for file changes\./;
var timePart = /^[\x1B\[;m0-9]*\d+:\d+:\d+[\x1B\[\];m0-9]*\s/;
var filePath = /^.+\.ts\(\d+/;
var compileStatus = [];
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            return [2 /*return*/, rush_tools_1.buildProjects(function (_a) {
                    var packageName = _a.packageName, projectFolder = _a.projectFolder;
                    return __awaiter(_this, void 0, void 0, function () {
                        var path, pkg, watchScript, p, status;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    path = path_1.resolve(paths_1.REPO_ROOT, projectFolder);
                                    pkg = require(path_1.resolve(path, 'package.json'));
                                    watchScript = pkg.scripts && pkg.scripts.watch;
                                    if (!watchScript) {
                                        console.error("\u001B[38;5;14m" + packageName + "\u001B[38;5;10m skip - no watch script\u001B[0m");
                                        return [2 /*return*/];
                                    }
                                    console.error("\u001B[38;5;14m" + packageName + "\u001B[38;5;10m run watch script\u001B[0m");
                                    p = child_process_1.spawn(watchScript, {
                                        cwd: path,
                                        shell: true,
                                        stdio: ['inherit', 'pipe', 'inherit'],
                                        env: process.env
                                    });
                                    waitHandle(packageName, p);
                                    status = {
                                        title: packageName,
                                        success: false,
                                        absolute: path,
                                        relative: path_1.relative(paths_1.REPO_ROOT, path)
                                    };
                                    compileStatus.push(status);
                                    return [4 /*yield*/, stdoutHandle(status, p.stdout)];
                                case 1:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    });
                })];
        });
    });
}
var ps = [];
function waitHandle(title, p) {
    ps.push(p);
    p.on('exit', function (code, signal) {
        console.error("\u001B[38;5;14m" + title + "\u001B[38;5;9m watch exit with %s", signal ? 'signal ' + signal : code);
        ps.forEach(function (p) {
            p.kill('SIGINT');
        });
    });
}
function stdoutHandle(status, stdout) {
    var split = stdout.pipe(split2());
    var allowClear = false;
    var shouldClear = false;
    return new Promise(function (resolve) {
        split.on('data', function filterPassthrough(line) {
            var toPrint = '';
            var data = line.toString();
            if (clearSeq.test(data)) {
                data = data.replace(clearSeq, '');
                if (allowClear) {
                    shouldClear = true;
                }
            }
            data = data.replace(timePart, '');
            if (compileComplete.test(data)) {
                allowClear = true;
                resolve();
                toPrint += "\u001B[2m[" + status.title + "]\u001B[0m " + data + "\n";
                status.success = true;
            }
            else if (compileError.test(data)) {
                allowClear = true;
                toPrint += "\u001B[38;5;9m[" + status.title + "]\u001B[0m " + data + "\n";
                status.success = false;
            }
            else if (filePath.test(data)) {
                toPrint += status.relative + "/" + data + "\n";
            }
            else {
                toPrint += data + "\n";
            }
            if (shouldClear) {
                shouldClear = false;
                process.stdout.write('\x1Bc');
                dumpFailed();
            }
            process.stdout.write(toPrint);
        });
    });
}
function dumpFailed() {
    var failed = compileStatus.filter(function (_a) {
        var success = _a.success;
        return !success;
    });
    if (failed.length === 0) {
        return process.stdout.write('No project has error.\n');
    }
    process.stdout.write(failed.length + ' project can not compile:\n');
    for (var _i = 0, failed_1 = failed; _i < failed_1.length; _i++) {
        var title = failed_1[_i].title;
        process.stdout.write(' * ' + title + '\n');
    }
}
main().then(function () {
    console.log("\u001B[38;5;10mAll projects compiled at least one time.\u001B[0m ");
}, function (e) {
    setImmediate(function () {
        throw e;
    });
});
