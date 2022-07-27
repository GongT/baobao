import { AlreadyReportedError, Executable } from '@rushstack/node-core-library';
import { RushStackConfig } from '@build-script/rushstack-config-loader';
import { HeftConfiguration, HeftSession, ITestStageContext } from '@rushstack/heft';
import { IMyOptions, PLUGIN_NAME } from './plugin';

export function applyAutoTestImport(
	heftSession: HeftSession,
	heftConfiguration: HeftConfiguration,
	_config: RushStackConfig,
	_options: IMyOptions
) {
	heftSession.hooks.test.tap(PLUGIN_NAME, (test: ITestStageContext) => {
		test.hooks.run.tap(PLUGIN_NAME, async function _testImportSuccess() {
			heftConfiguration.globalTerminal.writeLine('start test import...');
			const success1 = tryEsImport(heftConfiguration.buildFolder);
			heftConfiguration.globalTerminal.writeLine('  - esm import: ', success1 ? 'success' : 'failed');
			const success2 = tryCjsRequire(heftConfiguration.buildFolder);
			heftConfiguration.globalTerminal.writeLine('  - cjs require: ', success1 ? 'success' : 'failed');

			if (!success1 || !success2) {
				throw new AlreadyReportedError();
			}
		});
	});
}

function tryEsImport(dir: string) {
	return spawnNodeTry(
		dir,
		`
import(require('./package.json').module).then(
	() => { process.exit(0); },
	(e) => {
		console.error('\\x1B[38;5;9mES Module mode import() failed:\\x1B[0m %s', (e.code === 'ERR_MODULE_NOT_FOUND' || e.code === 'ERR_REQUIRE_ESM') ? e.message : e.stack);
		process.exit(1);
	});
`
	);
}

function tryCjsRequire(dir: string) {
	return spawnNodeTry(
		dir,
		`
try {
	require('.');
	process.exit(0);
} catch(e) {
	console.error('\\x1B[38;5;9mCommongJS mode require() failed:\\x1B[0m %s', (e.code === 'ERR_MODULE_NOT_FOUND' || e.code === 'ERR_REQUIRE_ESM') ? e.message : e.stack);
	process.exit(1);
}
`
	);
}
function spawnNodeTry(dir: string, command: string) {
	const r = Executable.spawnSync(process.argv0, ['-e', command], {
		currentWorkingDirectory: dir,
		stdio: 'inherit',
		timeoutMs: 3000,
	});
	return r.status === 0;
}
