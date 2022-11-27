const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { resolve } = require('path');
const dir = resolve(__dirname, '../temp');
if (!existsSync(dir)) {
	mkdirSync(dir);
}
const file = resolve(dir, 'watching');
if (!existsSync(file)) {
	writeFileSync(file, '1', 'utf-8');
}
