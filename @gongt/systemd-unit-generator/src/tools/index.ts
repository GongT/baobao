import { execa } from 'execa';

export interface IValidOpt {
	ignoreDependency?: boolean;
	ignoreExec?: boolean;
}

export async function systemdAnalyzeVerify(file: string, options: IValidOpt = {}) {
	options = Object.assign({}, { ignoreDependency: true, ignoreExec: true }, options);

	const ret = await execa('systemd-analyze', ['verify', file], {
		stdout: 'ignore',
		stdin: 'ignore',
		stderr: 'pipe',
		reject: false,
	});

	const errors: string[] = [];
	for (const item of ret.stderr.split('\n')) {
		if (options.ignoreExec && item.includes('is not executable')) {
			continue;
		}
		if (options.ignoreDependency && item.includes('Failed to add dependency')) {
			continue;
		}

		errors.push(item);
	}
	return errors;
}
