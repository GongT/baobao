const fs = require('fs');
const path = require('path');

const undo = process.argv.includes('--undo');
const entryFile = path.resolve(__dirname, '../heft-plugin.json');
const backupFile = path.resolve(__dirname, '../temp/heft-plugin.json.back');

if (undo) {
	if (!fs.existsSync(backupFile)) {
		throw new Error('backup file not exists, unclean exit detected.');
	}
	fs.copyFileSync(backupFile, entryFile);
	fs.unlinkSync(backupFile);
} else {
	if (fs.existsSync(backupFile)) {
		throw new Error('backup file exists, unclean exit detected.');
	}
	fs.copyFileSync(entryFile, backupFile);
	const data = JSON.parse(fs.readFileSync(entryFile, 'utf8'));
}
