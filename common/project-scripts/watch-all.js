"use strict";
exports.__esModule = true;
require("./lib/respawnSystemd");
var rush_tools_1 = require("@idlebox/rush-tools");
var child_process_1 = require("child_process");
var fs_extra_1 = require("fs-extra");
var path_1 = require("path");
var root = rush_tools_1.getCurrentRushRootPath();
var needToWatch = rush_tools_1.resolveRushProjectBuildOrder()
    .map(function (list // filter sub projects
) {
    return list.filter(function (_a) {
        var projectFolder = _a.projectFolder;
        var path = path_1.resolve(root, projectFolder);
        var pkg = require(path_1.resolve(path, 'package.json'));
        return pkg.scripts && pkg.scripts.watch;
    });
})
    .filter(function (list) { return list.length; });
var importSection = "\nconst { spawn } = require('child_process');\n\nconst needToWatch = " + JSON.stringify(needToWatch) + ";\n\n";
var script = importSection + '\n\n(' + mainScript.toString() + ')()';
var bootFilePath = path_1.resolve(__dirname, '../temp/scripts/watch-all-run.mjs');
fs_extra_1.mkdirpSync(path_1.dirname(bootFilePath));
fs_extra_1.writeFileSync(bootFilePath, script);
function mainScript() {
    var ps = [];
    for (var _i = 0, needToWatch_1 = needToWatch; _i < needToWatch_1.length; _i++) {
        var pList = needToWatch_1[_i];
        for (var _a = 0, pList_1 = pList; _a < pList_1.length; _a++) {
            var project = pList_1[_a];
            var path = path_1.resolve(root, project.projectFolder);
            console.error(' + run watch: %s', path);
            var p = child_process_1.spawn(process.env.NPM_BIN, ['run', 'watch'], {
                cwd: path,
                stdio: 'inherit'
            });
            ps.push(p);
            p.on('exit', function (code, signal) {
                console.error('watch [%s] exit with %s', signal ? 'signal ' + signal : code);
                ps.forEach(function (p) {
                    p.kill('SIGINT');
                });
            });
        }
    }
}
