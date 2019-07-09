import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { writeJsonFileIfChanged } from '@idlebox/node-json-edit';
import { Extractor, ExtractorConfig, ExtractorLogLevel, IConfigFile } from '@microsoft/api-extractor';
import { copyFile, ensureDir, mkdirpSync } from 'fs-extra';
import { basename, dirname, resolve } from 'path';
import { API_CONFIG_FILE, EXPORT_TEMP_PATH, PROJECT_ROOT } from '../inc/argParse';
import { findUp } from '../inc/findUp';
import { projectPackagePath } from '../inc/package';
import { relativePosix } from '../inc/paths';

const apiExtractorJson: IConfigFile = {
	// $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
	projectFolder: EXPORT_TEMP_PATH,
	mainEntryPointFilePath: '<projectFolder>/declare-output/_export_all_in_once_index.d.ts',
	compiler: {
		tsconfigFilePath: '<projectFolder>/tsconfig.json',
		// "overrideTsconfig": {}
		// "skipLibCheck": true,
	},
	apiReport: {
		enabled: true,
		reportFileName: '<unscopedPackageName>.api.md',
		reportFolder: PROJECT_ROOT + '/docs/',
		// reportTempFolder: '<projectFolder>/temp/',
	},
	docModel: {
		enabled: true,
		apiJsonFilePath: PROJECT_ROOT + '/docs/<unscopedPackageName>.api.json',
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
				logLevel: ExtractorLogLevel.Warning,
				addToApiReportFile: true,
			},
		},
		extractorMessageReporting: {
			default: {
				logLevel: ExtractorLogLevel.Warning,
				addToApiReportFile: true,
			},
		},
		tsdocMessageReporting: {
			default: {
				logLevel: ExtractorLogLevel.Warning,
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

	console.log('\x1B[38;5;10minvoke api-extractor api...\x1B[0m');
	const config = ExtractorConfig.loadFileAndPrepare(API_CONFIG_FILE);

	// Invoke API Extractor
	const extractorResult = Extractor.invoke(config, {
		// Equivalent to the "--local" command-line parameter
		localBuild: true,
		// Equivalent to the "--verbose" command-line parameter
		showVerboseMessages: true,
	});

	if (extractorResult.succeeded) {
		console.log(`API Extractor completed successfully`);
	} else {
		throw new Error(`API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`);
	}

	const foundRush = findUp(PROJECT_ROOT, 'rush.json');
	if (foundRush) {
		console.log('Found rush repo, creating link...');
		const reviewPath = resolve(foundRush, '../common/reviews/api');
		await ensureDir(reviewPath);
		const reviewFile = resolve(reviewPath, basename(config.reportFilePath));

		const target = relativePosix(reviewPath, config.reportFilePath);
		console.log('  * %s -> %s', reviewFile, target);
		await ensureLinkTarget(target, reviewFile);
	}
}
