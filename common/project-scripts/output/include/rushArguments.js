"use strict";
exports.__esModule = true;
function getopts(argv) {
    if (argv === void 0) { argv = process.argv.slice(2); }
    var opts = {};
    for (var index = 0; index < argv.length; index++) {
        var item = argv[index];
        if (!item.startsWith('-')) {
            throw new Error('Unknown argument: ' + item);
        }
        var name_1 = item.replace(/^-+/, '');
        var next = argv[index + 1];
        if (next.startsWith('-')) {
            opts[name_1] = true;
        }
        else {
            opts[name_1] = next;
            index++;
        }
    }
    return opts;
}
exports.getopts = getopts;
