import { API_CONFIG_FILE, PROJECT_ROOT } from './argParse';
import { writeJsonFileIfChanged } from '@idlebox/node-json-edit';
import { ensureDir } from 'fs-extra';
import { dirname } from 'path';

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

export async function rewriteApiExtractorConfig() {
	await ensureDir(dirname(API_CONFIG_FILE));
	await writeJsonFileIfChanged(API_CONFIG_FILE, apiExtractorJson);
}
