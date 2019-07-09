import { API_CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from '../inc/argParse';
import { copyFile, ensureDir, mkdirpSync } from 'fs-extra';
import { dirname, resolve } from 'path';
import { run } from '../inc/run';
import { projectPackagePath } from '../inc/package';
import { writeJsonFileIfChanged } from '@idlebox/node-json-edit';

const apiExtractorJson = {
	$schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
	projectFolder: '.',
	mainEntryPointFilePath: '<projectFolder>/declare-output/_export_all_in_once_index.d.ts',
	compiler: {
		tsconfigFilePath: '<projectFolder>/tsconfig.json',
		// "overrideTsconfig": {}
		// "skipLibCheck": true,
	},
	apiReport: {
		enabled: true,
		// "reportFileName": "<unscopedPackageName>.api.md",
		reportFolder: PROJECT_ROOT + '/docs/',
		// "reportTempFolder": "<projectFolder>/temp/"
	},
	docModel: {
		enabled: true,
		// "apiJsonFilePath": "<projectFolder>/temp/<unscopedPackageName>.api.json"
	},
	dtsRollup: {
		enabled: true,
		// "untrimmedFilePath": "<projectFolder>/dist/<unscopedPackageName>.d.ts",
		// "betaTrimmedFilePath": "<projectFolder>/dist/<unscopedPackageName>-beta.d.ts",
		publicTrimmedFilePath: PROJECT_ROOT + '/docs/package-public.d.ts',
		omitTrimmingComments: false,
	},
	tsdocMetadata: {
		enabled: true,
		tsdocMetadataFilePath: PROJECT_ROOT + '/docs/tsdoc-metadata.json',
	},
	messages: {
		compilerMessageReporting: {
			default: {
				logLevel: 'warning',
				addToApiReportFile: true,
			},
		},
		extractorMessageReporting: {
			default: {
				logLevel: 'warning',
				addToApiReportFile: true,
			},
		},
		tsdocMessageReporting: {
			default: {
				logLevel: 'warning',
				addToApiReportFile: true,
			},
		},
	},
};

async function rewriteApiExtractorConfig() {
	await ensureDir(dirname(API_CONFIG_FILE));
	await writeJsonFileIfChanged(API_CONFIG_FILE, apiExtractorJson);
}

export async function runApiExtractor() {
	console.log('\x1B[38;5;10mwrite api-extractor.json...\x1B[0m');
	await rewriteApiExtractorConfig();

	console.log('\x1B[38;5;10mcopy package.json...\x1B[0m');
	await copyFile(projectPackagePath(), resolve(EXPORT_TEMP_PATH, 'package.json'));

	await mkdirpSync(resolve(PROJECT_ROOT, 'docs'));
	await run('api-extractor', ['run', '-c', API_CONFIG_FILE, '--local', '--verbose']);
}
