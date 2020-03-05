"use strict";
exports.__esModule = true;
require("source-map-support/register");
var node_json_edit_1 = require("@idlebox/node-json-edit");
var rush_tools_1 = require("@idlebox/rush-tools");
var fs_extra_1 = require("fs-extra");
var rushArguments_1 = require("./include/rushArguments");
var _a = rushArguments_1.getopts(), file = _a.file, action = _a.action, key = _a.key, value = _a.value;
var actionCallback = createAction();
function createAction() {
    switch (action) {
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
if (!key || !actionCallback) {
    console.error('$0 -f <file-name.json> -a <push|unshift|set|unset> -k <.path.to.prop> [-v value]');
    process.exit(1);
}
if (actionCallback !== del && !value) {
    console.error('$0 -f <file-name.json> -a <push|unshift|set|unset> -k <.path.to.prop> [-v value]');
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
var parsedValue = parseValue(value);
var success = 0, fail = 0;
var rush = new rush_tools_1.RushProject();
for (var _i = 0, _b = rush.projects; _i < _b.length; _i++) {
    var _c = _b[_i], projectFolder = _c.projectFolder, packageName = _c.packageName;
    var path = rush.absolute(projectFolder, file);
    if (!fs_extra_1.pathExistsSync(path)) {
        continue;
    }
    try {
        console.error('modify: %s', packageName, key, parsedValue);
        var json = node_json_edit_1.loadJsonFileSync(path);
        var changed = actionCallback(json, key, parsedValue);
        if (changed) {
            node_json_edit_1.writeJsonFileBackSync(json);
        }
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
        if (!obj.hasOwnProperty(part)) {
            // console.log('%s: object path not exists', debug);
            obj[part] = {};
        }
        obj = obj[part];
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
    if (arr === undefined) {
        obj[last] = [value];
        return true;
    }
    else if (!Array.isArray(arr)) {
        throw new Error(path + ': array required.');
    }
    if (arr.length) {
        mustSame(arr[0], value);
    }
    obj[last].push(value);
    return true;
}
function unshift(json, path, value) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    var arr = obj[last];
    if (arr === undefined) {
        obj[last] = [value];
        return true;
    }
    else if (!Array.isArray(arr)) {
        throw new Error(path + ': array required.');
    }
    if (arr.length) {
        mustSame(arr[0], value);
    }
    obj[last].unshift(value);
    return true;
}
function set(json, path, value) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    if (last in obj) {
        mustSame(obj[last], value);
    }
    obj[last] = value;
    return true;
}
function del(json, path) {
    var _a = pathInfo(json, path), obj = _a.obj, last = _a.last;
    if (last in obj) {
        if (Array.isArray(obj)) {
            obj.splice(last, 1);
        }
        else {
            delete obj[last];
        }
        return true;
    }
    else {
        return false;
    }
}
