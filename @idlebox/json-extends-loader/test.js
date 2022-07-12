const { resolve } = require('path');
const lib = require('.');
const ret = lib.loadJsonFile(resolve(__dirname, 'src/tsconfig.json'), { readJsonFile: lib.readJsonFile(f) });
console.log(ret);
