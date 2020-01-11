const {loadJsonFileIfExists, writeJsonFileBack} = require('@idlebox/node-json-edit');
const {pathExists, ensureDir} = require('fs-extra');

(async () => {
	if (!await pathExists('rush.json')) {
		throw new Error('Cannot found rush.json in current directory');
	}
	
	const selfPackage = require(__dirname + '/package.json');
	
	await ensureDir('common/config/rush');
	const json = await loadJsonFileIfExists('common/config/rush/common-versions.json');
	if (!json.$schema) {
		json.$schema = 'https://developer.microsoft.com/json-schemas/rush/v5/common-versions.schema.json';
	}
	if (!json.preferredVersions) {
		json.preferredVersions = {};
	}
	json.preferredVersions[selfPackage.name] = selfPackage.version;
	
	await writeJsonFileBack(json);
})().then(() => {
	console.log('Done.');
}, (e) => {
	setTimeout(() => {
		throw e;
	}, 0);
});
