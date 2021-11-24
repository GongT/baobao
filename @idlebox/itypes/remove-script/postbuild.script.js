const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

const targetDts = resolve(process.cwd(), './docs/package-public.d.ts');
console.log('[@idlebox/itypes] fixing file: %s', targetDts);
let data = readFileSync(targetDts, 'utf-8').trim();

if (data.startsWith('/// ') && data.includes('@idlebox/itypes')) {
	data = data.slice(data.indexOf('\n'));
	data = data.trim() + '\n';
	console.log('[@idlebox/itypes] updated, write back');
	writeFileSync(targetDts, data, 'utf-8');
} else {
	console.log('[@idlebox/itypes] no need update');
}
