import { logger } from '@idlebox/logger';
import { projectRoot } from './paths.js';

interface ICommand {
	name: string | readonly string[];
	description: string;
	callback(input: string): void;
}

const stdinCommands: ICommand[] = [];
export function registerCommand(command: ICommand) {
	stdinCommands.push(command);
}

registerCommand({
	name: 'help',
	description: '显示帮助信息',
	callback: printHelp,
});

export function initializeStdin() {
	if (!process.stdin.isTTY) {
		return;
	}
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', (data: string) => {
		const text = data.trim();
		if (!text) return;

		logger.debug`recv: ${text}`;

		const firstWord = text.split(/\s/, 1)[0];

		for (const command of stdinCommands) {
			let match = false;
			if (Array.isArray(command.name)) {
				match = command.name.includes(firstWord);
			} else {
				match = command.name === firstWord;
			}
			if (match) {
				command.callback(text);
				console.log('');
				return;
			}
		}

		logger.warn`Unknown command: ${text} [type "help"]`;
		console.log('');
	});
	process.stdin.on('end', () => {
		console.log('End of input stream');
	});
}

function printHelp() {
	console.log('This is `mpis-run watch`');
	console.log(`working directory: ${projectRoot}`);

	console.log('Available commands:');
	for (const command of stdinCommands) {
		const n = Array.isArray(command.name) ? command.name.join(', ') : command.name;
		console.log(`  - ${n}: ${command.description}`);
	}
}
