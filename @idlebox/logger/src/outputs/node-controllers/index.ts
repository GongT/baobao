import type { NodejsOutput } from '../nodejs.js';
import { applyGithubActions } from './github-actions.js';

export function applyControllerByEnvironment(self: NodejsOutput) {
	if (process.env.CI) {
		if (process.env.GITHUB_ACTIONS) {
			applyGithubActions(self);
		}
	}
}
