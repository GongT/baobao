const {resolve} = require('path');
process.argv.slice(2).forEach((item) => {
	const target = resolve(process.cwd(), item);
	console.log('Remove target: %s', target);
	require('fs-extra').removeSync(target);
});
