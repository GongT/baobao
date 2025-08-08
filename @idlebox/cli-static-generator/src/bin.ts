import { createRootLogger, logger } from '@idlebox/logger';
import { findUpUntil, writeFileIfChange } from '@idlebox/node';
import { statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { makeIndexFile } from './builder.js';

createRootLogger('');

let project = process.argv[2];
if (!project) {
	logger.fatal(`usage: make-cli <commands-dir>[/*.ts]`);
}
let globs = '*.ts';
if (project.includes('*')) {
	const f = project.indexOf('*');
	globs = project.slice(f);
	project = project.slice(0, f);
}

const commandsDir = resolve(process.cwd(), project);
try {
	if (!statSync(commandsDir).isDirectory()) {
		logger.fatal`long<${commandsDir}> is not a directory`;
	}
} catch (e: any) {
	logger.fatal(e.message);
}

const tsconfig = await findUpUntil({ file: 'tsconfig.json', from: commandsDir });
if (!tsconfig) {
	throw logger.fatal(`can not find tsconfig.json from long<${commandsDir}>`);
}
const rootDir = dirname(tsconfig);

logger.log`glob ${globs} at long<${commandsDir}>`;

const jsonText = await makeIndexFile(rootDir, [globs], commandsDir);
const outFile = resolve(rootDir, 'commands.generated.ts');
await writeFileIfChange(outFile, jsonText);

logger.log`write to file long<${outFile}>`;
logger.success`complete.`;
