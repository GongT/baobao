const fs = require('fs');

const ROOT = process.cwd();

// TODO: real resolve
module.exports.default = function loadTransform(program, pluginOptions = {}) {
	const fp = ROOT + '/lib/' + pluginOptions.file.replace(/\.ts$/, '');
	if (fs.existsSync(fp + '.cjs')) {
		console.log('use commonjs: %s.cjs', fp);
		return require(fp + '.cjs').default(program, pluginOptions);
	} else {
		console.log('use esm: %s.js', fp);
		return require(fp + '.js').default(program, pluginOptions);
	}
};
