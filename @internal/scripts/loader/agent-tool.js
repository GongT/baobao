#!/usr/bin/env -S node --experimental-transform-types --disable-warning=ExperimentalWarning

import '@idlebox/native-executer/register';

const tool = process.argv[2];

if (!tool) {
	console.error('Usage: agent-tool <tool>\n\nSee usage in your skills file.');
	process.exit(233);
}

try {
	const entryPoint = import.meta.resolve(`../src/agent-tools/${tool}.ts`);
	process.argv.splice(1, 2, entryPoint);

	await import('../src/common/execute-prefix.ts');
	await import(entryPoint);
} catch (e) {
	if (e.code === 'ERR_MODULE_NOT_FOUND') {
		console.error(`\n\nUnknown tool: ${tool}`);
		agentUsage();
		process.exit(233);
	}
}

function agentUsage() {
	console.error(`\n\nUsage: agent-tool <tool>\nthere is no tool named ${tool}, this file should be located at /@internal/scripts/src/agent-tools/${tool}.ts`);
}
