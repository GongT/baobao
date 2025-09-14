import { logger, makeApplication } from '@idlebox/cli';
import { cli_commands, cli_imports } from './commands.generated.js';
import { projectPath } from './common/constants.js';

await makeApplication({ name: 'publisher', description: '一个用于发布npm包的工具', logPrefix: '' })
	.initialize((_, cmd) => {
		logger.log(`running "${cmd?.value}" in project "${projectPath}"`);
		process.env.npm_lifecycle_event = cmd?.value;
		process.env.lifecycle_event = cmd?.value;
	})
	.static(cli_imports, cli_commands);
