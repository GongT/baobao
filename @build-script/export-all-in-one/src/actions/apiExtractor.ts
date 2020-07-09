import { basename, dirname, resolve } from 'path';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { writeJsonFileIfChanged } from '@idlebox/node-json-edit';
import { Extractor, ExtractorConfig, ExtractorLogLevel, IConfigFile } from '@microsoft/api-extractor';
import { copyFile, ensureDir, mkdirpSync } from 'fs-extra';
import { API_CONFIG_FILE, EXPORT_TEMP_PATH, INDEX_FILE_NAME, PROJECT_ROOT, TEMP_DIST_DIR_NAME } from '../inc/argParse';
import { debug } from '../inc/debug';
import { findUp } from '../inc/findUp';
import { projectPackagePath } from '../inc/package';
import { relativePosix } from '../inc/paths';

const apiExtractorJson: IConfigFile = {
	// $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json',
	projectFolder: EXPORT_TEMP_PATH,
	mainEntryPointFilePath: `<projectFolder>/${TEMP_DIST_DIR_NAME}/${INDEX_FILE_NAME}.d.ts`,
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
			'tsdoc-undefined-tag': {
				logLevel: ExtractorLogLevel.None,
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
		// Setting `showDiagnostics=true` forces `showVerboseMessages=true`.
		showDiagnostics: false,
	});

	if (extractorResult.succeeded) {
		console.log(`API Extractor completed successfully`);
	} else {
		throw new Error(
			`API Extractor completed with ${extractorResult.errorCount} errors and ${extractorResult.warningCount} warnings`
		);
	}

	const foundRush = findUp(PROJECT_ROOT, 'rush.json');
	if (foundRush) {
		console.log('\x1B[38;5;10mcreate rush document link.\x1B[0m');
		const reviewPath = resolve(foundRush, '../common/reviews/api');
		await ensureDir(reviewPath);
		const reviewFile = resolve(reviewPath, basename(config.reportFilePath));

		const target = relativePosix(reviewPath, config.reportFilePath);
		debug('  * %s -> %s', reviewFile, target);
		await ensureLinkTarget(target, reviewFile);
	}
}
