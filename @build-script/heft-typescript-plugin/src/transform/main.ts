import type TypeScriptApi from 'typescript';
import { IMyTransformCallback } from '../helpers/transform-load.js';
import { appendCallback } from './appender.js';
import { ModuleResolver } from './library/ModuleResolver.js';
import { ReplacementSet } from './library/NodeReplacer.js';
import { isEsModule } from './library/util.js';
import { EmptyWalker, TopLevelWalker } from './library/walk.js';
import { ImportCommonJS } from './replace/importCommonJS.js';
import { ImportMetaReplacer } from './replace/importMetaReplacer.js';
import { ImportExportSpecifierReplacer } from './replace/importSpecifier.js';

// interface IMyOptions {}

const cache = new Map();

const transformer: IMyTransformCallback<TypeScriptApi.SourceFile> = function (
	context,
	{ ts, program, compilerHost, logger, extension },
) {
	const compilerOptions = program.getCompilerOptions();
	const resolver = new ModuleResolver(ts, compilerHost, compilerOptions, logger);
	const replacement = new ReplacementSet(ts, context, compilerHost, logger);

	const createAppendCallback = () => {
		return appendCallback(ts, extension, resolver, logger);
	};
	if (compilerOptions.module === ts.ModuleKind.CommonJS) {
		replacement.push(new ImportMetaReplacer(ImportMetaReplacer.UrlToFilename));
		replacement.push(new ImportExportSpecifierReplacer(createAppendCallback()));

		replacement.register();
		return EmptyWalker(logger.terminal);
	} else if (isEsModule(ts, compilerOptions.module)) {
		replacement.push(new ImportExportSpecifierReplacer(createAppendCallback()));

		replacement.register();

		const replaceMjsRequire = new ImportCommonJS(resolver, cache);
		replaceMjsRequire.attach({ logger, ts, context, host: compilerHost });

		return TopLevelWalker(ts, context, logger.terminal, (node) => {
			logger.terminal.writeDebugLine(' - ', ts.SyntaxKind[node.kind]);
			if (replaceMjsRequire.check(node)) {
				return replaceMjsRequire.replace(node) || node;
			}
			return node;
		});
	} else {
		const mname = Object.hasOwn(ts.ModuleKind, compilerOptions.module ?? '')
			? ts.ModuleKind[compilerOptions.module!]
			: '' + compilerOptions.module;
		logger.emitWarning(new Error(`unsupported module type: ${mname}`));
		return EmptyWalker(logger.terminal);
	}
};

export default transformer;
