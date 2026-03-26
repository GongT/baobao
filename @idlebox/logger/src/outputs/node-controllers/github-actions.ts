import type { Terminal } from '@idlebox/terminal-control';
import type { NodejsOutput } from '../nodejs.js';

export function applyGithubActions(self: NodejsOutput) {
	self.group = group;
	self.groupCollapsed = groupCollapsed;
	self.groupEnd = groupEnd;
}

function group(this: Terminal, message: string) {
	this.stream.write(`::group::${message}\n`);
}
function groupCollapsed(this: Terminal, message: string) {
	this.stream.write(`::group::${message}\n`);
}
function groupEnd(this: Terminal) {
	this.stream.write(`::endgroup::\n`);
}
