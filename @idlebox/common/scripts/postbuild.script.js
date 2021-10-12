const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const targetDts = resolve(__dirname, '../docs/package-public.d.ts');
console.log('fixing file: %s', targetDts);
let data = readFileSync(targetDts, 'utf-8').trim();

if (data.startsWith('/// ')) {
	data = data.slice(data.indexOf('\n'));
	data = data.trim() + '\n';
	console.log('updated, write back');
	writeFileSync(targetDts, data, 'utf-8');
} else {
	console.log('no need update');
}
