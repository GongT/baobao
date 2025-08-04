import { execaSync } from 'execa';
import type { ICommandToRun } from '../common/types.js';

export function execveOrSpawn(command: ICommandToRun): never {
	if (process.execve) {
		const env = {
			...process.env,
			...command.extraEnv,
		};

		// console.log(command.commands);
		process.execve(command.commands[0], command.commands, env);
	} else {
		console.error(`execve not available, falling back to execa`);
		const r = execaSync(command.commands[0], command.commands.slice(1), {
			env: command.extraEnv,
			stdio: 'inherit',
		});
		process.exit(typeof r.exitCode === 'number' ? r.exitCode : 1);
	}

	throw new Error('execve command not execute correctly');
}
