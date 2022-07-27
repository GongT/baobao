const { basename, resolve } = require('path');
const { remove } = require('./remove');

const pluginName = require(resolve(__dirname, '../package.json')).name;
const PLUGIN_NAME = basename(pluginName);

/**
 *
 * @param {import("@rushstack/heft").HeftSession} heftSession
 * @param {*} heftConfiguration
 * @param {*} options
 */
function removeTypes(heftSession, heftConfiguration, options = {}) {
	heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
		build.hooks.postBuild.tap(PLUGIN_NAME, (postBuild) => {
			postBuild.hooks.run.tapPromise(PLUGIN_NAME, async function codegen() {
				remove(heftConfiguration.buildFolder);
			});
		});
	});
}

module.exports.pluginName = pluginName;
module.exports.PLUGIN_NAME = PLUGIN_NAME;
module.exports.apply = removeTypes;
