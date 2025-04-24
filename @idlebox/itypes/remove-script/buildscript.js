const { buildContext } = require('@build-script/builder');
const { resolve } = require('node:path');

buildContext.registerAlias('remove-extra-lib', resolve(__dirname, './postbuild.script.js'));
buildContext.addAction('post-build', ['remove-extra-lib']);
buildContext.postfixAction('build', ['post-build']);
