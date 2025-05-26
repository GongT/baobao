"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = generate;
var fs = require("node:fs");
var path = require("node:path");
function generate(builder, logger) {
    var pkgFile = path.resolve(__dirname, '../../package.json');
    var pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf-8'));
    logger.log('package info = %s @ %s', pkg.name, pkg.version);
    return "export const self_package_version = \"".concat(pkg.version, "\";\nexport const self_package_name = \"").concat(pkg.name, "\";\nexport const self_package_repository = \"").concat(pkg.repository, "\";\n");
}
