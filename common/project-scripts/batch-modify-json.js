"use strict";
exports.__esModule = true;
var path_1 = require("path");
var package_public_1 = require("@idlebox/rush-tools/docs/package-public");
var fs_extra_1 = require("fs-extra");
var node_json_edit_1 = require("@idlebox/node-json-edit/lib/node-json-edit");
var action = createAction();
function createAction() {
    switch (process.argv[3]) {
        case 'push':
            return push;
        case 'unshift':
            return unshift;
        case 'set':
            return set;
        case 'unset':
            return del;
    }
}
var file = process.argv[2];
var key = process.argv[4];
var value = process.argv[5];
if (undefined === key || undefined === action) {
    console.error('$0 <file-name.json> <push|unshift|set|unset> <.path.to.prop> [value]');
    process.exit(1);
}
if (action !== del && value === undefined) {
    console.error('$0 <file-name.json> <push|unshift|set|unset> <.path.to.prop> [value]');
    process.exit(1);
}
if (!key.startsWith('.')) {
    console.error('Error: key must starts with "."');
    process.exit(1);
}
function parseValue(value) {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    if (!isNaN(parseFloat(value))) {
        return parseFloat(value);
    }
    return value;
}
value = parseValue(value);
var success = 0, fail = 0;
var root = package_public_1.getCurrentRushRootPath();
for (var _i = 0, _a = package_public_1.eachProject(); _i < _a.length; _i++) {
    var _b = _a[_i], projectFolder = _b.projectFolder, packageName = _b.packageName;
    var path = path_1.resolve(root, projectFolder, file);
    if (!fs_extra_1.pathExistsSync(path)) {
        continue;
    }
    try {
        console.error('modify: %s', packageName, key, value);
        var json = node_json_edit_1.loadJsonFileSync(path);
        action(json, key, value);
        node_json_edit_1.writeJsonFileBackSync(json);
        console.error('\x1B[A\x1B[K\x1B[38;5;10m✔\x1B[0m - %s', packageName);
        success++;
    }
    catch (e) {
        console.error(' > \x1B[38;5;9m%s\x1B[0m\x1B[K', e.message);
        console.error(' > %s', path);
        fail++;
    }
}
console.error('success: %s, fail: %s\x1B[K', success, fail);
process.exit(fail);
function pathInfo(obj, path) {
    var ps = path.split('.');
    ps.shift();
    var last = ps.pop();
    var debug = '';
    for (var _i = 0, ps_1 = ps; _i < ps_1.length; _i++) {
        var part = ps_1[_i];
        debug += '.' + part;
        if (obj.hasOwnProperty(part)) {
            obj = obj[part];
        }
        else {
            console.log('%s: object path not exists', debug);
        }
    }
    return { obj: obj, last: last };
}
function mustSame(a, b) {
    if (typeof a !== typeof b) {
        throw new Error("cannot set type " + typeof b + " to a field with type " + typeof a);
    }
}
function push(json, path, value) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    var arr = obj[last];
    if (!Array.isArray(arr)) {
        throw new Error(path + ': array required.');
    }
    if (arr.length) {
        mustSame(arr[0], value);
    }
    obj[last].push(value);
}
function unshift(json, path, value) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    var arr = obj[last];
    if (!Array.isArray(arr)) {
        throw new Error(path + ': array required.');
    }
    if (arr.length) {
        mustSame(arr[0], value);
    }
    obj[last].unshift(value);
}
function set(json, path, value) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    if (last in obj) {
        mustSame(obj[last], value);
    }
    obj[last] = value;
}
function del(json, path) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    if (last in obj) {
        delete obj[last];
    }
    else {
        throw new Error(path + ': not exists.');
    }
}
