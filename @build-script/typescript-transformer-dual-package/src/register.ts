import { format } from 'util';
import ts, {
	CompilerOptions,
	Program,
	SourceFile,
	TransformationContext,
	Transformer,
	TransformerFactory,
} from 'typescript';
import { appendDotCjs, cloneProgram } from './append.cjs';
import { appendDotCjsDirect } from './append.cjs.heft';
import { appendDotJs } from './append.js';
import { getDebug, IDebug } from './debug';
import { selfCreatedProgram } from './preventLoop';

export { ISelfTest } from './self.test';
export type Extension = '.js' | '.mjs' | '.cjs';

interface IOptions {
	mjs?: Extension | false;
	cjs?: Extension | false;
	compilerOptions?: CompilerOptions;
	verbose?: boolean;
	logger?: any;
}

export interface ITransformerSlice {
	(program: Program, transformationContext: TransformationContext, debug: IDebug): Transformer<SourceFile>;
}

let lastProgram: Program;
let cachedTransformer: TransformerFactory<SourceFile>;

function makeLogger(logger: any, verbose: boolean) {
	return {
		debug(msg: string, ...args: any) {
			if (verbose) {
				logger.terminal.writeLine(format(msg, ...args));
			} else {
				logger.terminal.writeVerboseLine(format(msg, ...args));
			}
		},
		error(msg: string) {
			logger.terminal.writeWarningLine(msg);
		},
	};
}

export default function typescriptTransformerDualPackage(program: Program, pluginOptions: IOptions) {
	const verbose = pluginOptions.verbose || process.env.NODE_DEBUG?.includes('tramsform') || false;
	const logger = pluginOptions.logger ? makeLogger(pluginOptions.logger, verbose) : getDebug(verbose);

	if (selfCreatedProgram in program) {
		return () => {
			(node: SourceFile) => node;
		};
	}
	if (program === lastProgram) {
		return cachedTransformer;
	}
	lastProgram = program;

	if (pluginOptions.logger) {
		let transformer: ts.TransformerFactory<ts.SourceFile>;
		const mdl = program.getCompilerOptions().module as number;
		logger.debug('emit program type ' + ts.ModuleKind[mdl]);
		if (mdl === ts.ModuleKind.CommonJS) {
			if (pluginOptions.cjs === false) {
				logger.debug('config cjs is false');
				transformer = noop;
			} else {
				const ext: Extension = pluginOptions.cjs || '.cjs';
				logger.debug('creating program for %s', ext);
				transformer = function transformer(transformationContext: TransformationContext) {
					logger.debug('[trans] NewContext');
					return appendDotCjsDirect(program, transformationContext, logger);
				};
			}
		} else if (mdl >= ts.ModuleKind.ES2015 && mdl <= ts.ModuleKind.ESNext) {
			if (pluginOptions.mjs === false) {
				logger.debug('config mjs is false');
				transformer = noop;
			} else {
				const ext: Extension = pluginOptions.mjs || '.js';
				logger.debug('creating program for %s', ext);
				transformer = function transformer(transformationContext: TransformationContext) {
					logger.debug('[trans] NewContext');
					return appendDotJs(program, transformationContext, logger);
				};
			}
		} else {
			logger.debug('creating noop program');
			transformer = noop;
		}
		return transformer;
	} else {
		const shadowCompilerOptions = pluginOptions.compilerOptions || {};
		shadowCompilerOptions.declaration = false;
		shadowCompilerOptions.declarationMap = false;
		// console.error('[dual-package]: ttsc: creating shadow program!');
		const shadowProgram = cloneProgram(program, shadowCompilerOptions, logger);
		const appendDotCjsCall = appendDotCjs(shadowProgram, logger);

		return (cachedTransformer = function transformer(transformationContext: TransformationContext) {
			logger.debug('[trans] NewContext');

			const appendDotJsCall = appendDotJs(program, transformationContext, logger);

			return (sourceFile: SourceFile) => {
				appendDotCjsCall(sourceFile);
				return appendDotJsCall(sourceFile);
			};
		});
	}
}

function noop() {
	return (s: ts.SourceFile) => s;
}
