const {items, rushRootPath, pushGlobalNodeModules, readJsonSync} = require('./list-projects');
const {spawn} = require('child_process');
const {resolve, basename} = require('path');
const {existsSync, createWriteStream} = require('fs');

process.exit(0);

pushGlobalNodeModules(module);
const tsc = require.resolve('typescript/lib/tsc.js');
const eao = resolve(rushRootPath, 'tools/export-all-in-one/index.js');

const jsonc = require('jsonc');

(async () => {
	for (const [name, item]of items.entries()) {
		const src = resolve(process.cwd(), item, 'src');
		console.log(` << prepare: ${name}.`);
		
		if (existsSync(src)) {
			const log = resolve(process.cwd(), item, basename(item) + '.prepare.log');
			const f = createWriteStream(log);
			
			try {
				await doTsc(f, src);
				f.write('\ntsc success.\n\n');
				await doExportAll(f, src);
				f.write('\nexport success.\n\n');
			} catch (e) {
				f.write(`\n\nerror: ${e.message}\n`);
				console.error(`error: ${e.stack}`);
				console.error(` >> prepare: ${name} complete.`);
				throw new Error(`prepare failed in folder ${item}`);
			} finally {
				f.close();
			}
		} else {
			console.log('path not exists: %s - skip this', src);
		}
		console.log(` >> prepare: ${name} complete.`);
	}
})().catch((e) => {
	setImmediate(() => {
		throw e;
	});
});

function doExportAll(f, src) {
	const {main} = readJsonSync(resolve(src, '../package.json'));
	if (!main || !main.includes('export_all_in_one')) {
		f.write(`no export all in one ${main}\n`);
		return;
	}
	
	f.write(`node\n\t${eao}\n\t${src}\n`);
	
	const ps = spawn('node', [eao, src], {
		stdio: 'pipe',
	});
	
	return waitProcess(ps, f);
}

function doTsc(f, src) {
	f.write(`node\n\t${tsc}\n\t-p\n\t${src}\n\t--noEmitOnError\n\tfalse\n`);
	
	const ps = spawn('node', [tsc, '-p', src, '--noEmitOnError', 'false'], {
		stdio: 'pipe',
	});
	
	return waitProcess(ps, f);
}

function waitProcess(ps, f) {
	ps.stdout.pipe(process.stdout);
	ps.stderr.pipe(process.stderr);
	ps.stdout.pipe(f, {end: false});
	ps.stderr.pipe(f, {end: false});
	
	return new Promise((resolve, reject) => {
		ps.on('error', reject);
		ps.on('exit', (c, s) => {
			if (c !== 0) {
				return reject(new Error('exit with code ' + c));
			}
			if (s) {
				return reject(new Error('exit with signal ' + s));
			}
			resolve();
		});
	});
}