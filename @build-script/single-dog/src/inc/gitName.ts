import { exec, ExecException } from 'child_process';

export interface IGitInfo {
	full: string;
	user: string;
	email: string;
}

let memo: IGitInfo;

export async function getGitName(): Promise<IGitInfo> {
	if (memo) {
		return memo;
	}
	const user = await execm('git config user.name');
	const email = await execm('git config user.email');

	return (memo = {
		full: `${user} <${email}>`,
		user: user.toLowerCase(),
		email,
	});
}

function execm(cmd: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(
			cmd,
			{
				encoding: 'utf8',
				cwd: CONTENT_ROOT,
			},
			(error: ExecException | null, stdout: string, stderr: string) => {
				if (error) {
					return reject(error);
				}
				if (stdout && stderr) {
					console.error(stderr);
				}
				if (stdout) {
					resolve(stdout.trim());
				} else if (stderr) {
					reject(new Error(stderr));
				} else {
					reject(new Error(`command "${cmd}" not return valid result.`));
				}
			}
		);
	});
}
