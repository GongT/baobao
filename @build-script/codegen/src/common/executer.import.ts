import { Assertion } from '@idlebox/common';
import { callGenerateFunction } from '../client/call-generate-function.js';
import type { IGenerateFunction } from '../client/generate-context.js';
import { BaseExecuter } from './executer.base.js';
import type { IGenerateResult } from './spawn/messages.js';

// const generatorSuffix = /\.generator\.ts$/;

export class ImportExecuter extends BaseExecuter {
	protected override systemWatchingFiles = [];
	private generate_function?: IGenerateFunction;

	protected override async _rebuild() {
		Assertion.ok(!this.generate_function, '只有非watch使用ImportExecuter，此时不可能重新编译');
		const gen = await import(this.sourceFile);
		if (typeof gen.generate !== 'function') {
			throw new Error(`module ${this.sourceFile} must export "generate" function`);
		}

		this.generate_function = gen.generate;
	}

	protected override async _execute(): Promise<IGenerateResult> {
		Assertion.ok(this.generate_function, 'generate_function should not be null');

		return callGenerateFunction({
			projectRoot: this.options.projectRoot,
			sourceFile: this.sourceFile,
			logger: this.logger,
			generate: this.generate_function,
		});
	}
}
