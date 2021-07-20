const fs = require('fs');

if (!fs.existsSync('lib/package.json')) {
	if (!fs.existsSync('lib')) {
		fs.mkdirSync('lib');
	}

	fs.writeFileSync(
		'lib/package.json',
		JSON.stringify({
			type: 'commonjs',
		}),
		'utf-8'
	);
}
