import { runAutoFix } from './commands/autofix';
import { runForEach } from './commands/foreach';

const commandRegistry: { [id: string]: () => Promise<void> } = {
	autofix: runAutoFix,
	each: runForEach,
};

export default function main() {
	const command: undefined | string = process.argv.slice(2).find(item => !item.startsWith('-'));
	if (!command) {
		showHelp();
	} else if (commandRegistry[command]) {
		return commandRegistry[command]();
	} else {
		throw new Error('No such command: ' + command);
	}
}

function showHelp() {
	console.error('Available commands: %s', Object.keys(commandRegistry).join(', '));
	process.exit(1);
}
