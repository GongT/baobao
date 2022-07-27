import { dirname, isAbsolute } from 'path';
import { bindThis, getErrorFrame } from '@idlebox/common';
import ts from 'typescript';
import { cache } from './inc/cache';
import { getValidPackageFile } from './inc/getValidPackageName';
import { getDebug, IDebug, wrapHeftLogger } from './logger';
import { ModuleResolver } from './ModuleResolver';

import type { IScopedLogger } from '@rushstack/heft';
Error.stackTraceLimit = Infinity;

export enum EngineKind {
	Heft,
	TTypescript,
}

export interface IPublicOptions {
	verbose?: boolean;
	logger?: IScopedLogger;
}

function noFilter(files: readonly string[]) {
	return files as string[];
}

export interface IMutation {
	types: ts.SyntaxKind[];
	method: (node: ts.Node) => ts.Node | void;
}
export interface INotify {
	types: ts.SyntaxKind[];
	method: (node: ts.Node) => boolean | void;
}

export abstract class TypescriptTransformPlugin<IOptions extends Record<string, any> = {}> {
	private readonly callee: Error;
	protected declare isDebug: boolean;
	protected declare engine: EngineKind;
	protected declare logger: IDebug;
	protected declare _program: ts.Program;
	protected declare context: ts.TransformationContext;
	public declare pluginOptions: Readonly<IOptions & IPublicOptions>;
	protected declare compilerHost: ts.CompilerHost;

	private readonly _mutations: IMutation[] = [];
	private readonly _notifies: INotify[] = [];
	private _compilerOptions?: ts.CompilerOptions;
	private configurePhase: boolean = false;
	protected declare resolver: ModuleResolver;

	protected transformToplevelNodes?(node: ts.Node): ts.Node | ts.Node[] | undefined;
	protected configure?(context: ts.TransformationContext, options: ts.CompilerOptions): void;

	constructor() {
		this.callee = new Error('');
		console.log('>>> plugin: %s <<<', this.pluginName);
		if (this.transformToplevelNodes) {
			this.transformToplevelNodes = this.transformToplevelNodes.bind(this);
		}
		this.plugin = this.plugin.bind(this);
	}

	private _pluginName?: string;
	public get pluginName(): string {
		if (this._pluginName) return this._pluginName;

		const p = getErrorFrame(this.callee, 2);
		let pkgpath: string;
		if (p.includes('(')) {
			pkgpath = dirname(p.slice(p.indexOf('(') + 1));
		} else {
			pkgpath = dirname(p.replace(/^at\s*/, ''));
		}
		if (pkgpath.startsWith('file://')) {
			pkgpath = pkgpath.slice('file://'.length);
		}
		if (!isAbsolute(pkgpath)) {
			return pkgpath.replace(/:[0-9:)]+$/, '');
		}

		const pkg = getValidPackageFile(pkgpath);
		if (!pkg) {
			return pkgpath.replace(/:[0-9:)]+$/, '');
		}

		this._pluginName = require(pkg).name as string;
		return this._pluginName;
	}

	protected get program(): ts.Program {
		this.logger.warn("don't use program if possible");
		return this._program;
	}
	public get compilerOptions(): ts.CompilerOptions {
		if (this._compilerOptions) {
			return this._compilerOptions;
		}
		this.logger.warn('best not to use before');
		return this._program.getCompilerOptions();
	}

	public forkProgram(
		overrideOptions: Partial<ts.CompilerOptions> = {},
		filter: (files: readonly string[]) => string[] = noFilter
	) {
		const prevOptions = this.context?.getCompilerOptions() ?? this.program.getCompilerOptions();
		const options = { ...prevOptions, ...overrideOptions };
		const host = ts.createCompilerHost(options, true);
		return ts.createProgram(filter(this._program.getRootFileNames()), options, host, this._program);
	}

	public plugin(program: ts.Program, options: IOptions & IPublicOptions) {
		if (this._program === program) return this.receiveContext;

		this._program = program;
		this.pluginOptions = options;

		if (
			options.verbose ||
			process.env.DEBUG_TRANSFORM_COMMON ||
			/\btramsform\b/i.test(process.env.NODE_DEBUG || '')
		) {
			this.isDebug = true;
		} else {
			this.isDebug = false;
		}

		if (!this.logger) {
			if (options.logger) {
				this.logger = wrapHeftLogger(options.logger, this.isDebug);
				this.engine = EngineKind.Heft;
			} else {
				this.logger = getDebug(this.isDebug);
				this.engine = EngineKind.TTypescript;
			}
			this.logger.debug('logger started');
		}

		return this.receiveContext;
	}

	private _onSubstituteNode(
		original: ts.TransformationContext['onSubstituteNode'],
		mutations: typeof this._mutations,
		hint: ts.EmitHint,
		node: ts.Node
	) {
		// console.log('  ! %s', ts.SyntaxKind[node.kind]);
		for (const { types, method } of mutations) {
			if (types.includes(node.kind)) {
				node = method.call(this, node) || node;
			}
		}
		return original(hint, node);
	}

	private _onEmitNode(
		original: ts.TransformationContext['onEmitNode'],
		notifies: typeof this._notifies,
		hint: ts.EmitHint,
		node: ts.Node,
		callback: (hint: ts.EmitHint, node: ts.Node) => void
	) {
		let willEmit = true;
		for (const { types, method } of notifies) {
			if (types.includes(node.kind)) {
				const emit: boolean | void = method.call(this, node);
				if (emit === false) {
					willEmit = false;
				}
			}
		}

		if (willEmit) original(hint, node, callback);
	}

	@bindThis
	protected registerNotifycation<T extends ts.Node>(
		kinds: ts.SyntaxKind[],
		func: (this: this, node: T) => boolean | void
	) {
		if (!this.configurePhase) this.logger.error('registerNotifycation only callable when configure()');
		this._notifies.push({ types: kinds, method: func as any });
	}

	@bindThis
	protected registerMutation<T extends ts.Node>(
		kinds: ts.SyntaxKind[],
		func: (this: this, node: T) => ts.Node | ts.Node[] | void
	) {
		if (!this.configurePhase) this.logger.error('registerMutation only callable when configure()');
		this._mutations.push({ types: kinds, method: func as any });
	}

	@bindThis
	private receiveContext(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
		this.context = context;
		this._compilerOptions = context.getCompilerOptions();

		this.logger.debug('==== New Context ====', ts.ModuleKind[this._compilerOptions.module!]);

		this.compilerHost = ts.createCompilerHost(this._compilerOptions, true);
		this.compilerHost.getModuleResolutionCache = cache(() =>
			ts.createModuleResolutionCache(
				this.compilerHost.getCurrentDirectory(),
				this.compilerHost.getCanonicalFileName,
				this._compilerOptions
			)
		);
		this.resolver = new ModuleResolver(this._compilerOptions, this.logger, this.compilerHost);
		if (this.configure) {
			this._notifies.length = 0;
			this._mutations.length = 0;
			this.configurePhase = true;
			this.configure(context, this._compilerOptions);
			this.configurePhase = false;
		}

		if (this._notifies.length) {
			context.onEmitNode = this._onEmitNode.bind(this, context.onEmitNode, this._notifies.slice());

			for (const item of this._notifies) {
				for (const kind of item.types) {
					context.enableEmitNotification(kind);
				}
			}
		}

		if (this._mutations.length) {
			context.onSubstituteNode = this._onSubstituteNode.bind(
				this,
				context.onSubstituteNode,
				this._mutations.slice()
			);

			for (const item of this._mutations) {
				for (const kind of item.types) {
					context.enableSubstitution(kind);
				}
			}
		}

		return this.transformer;
	}

	@bindThis
	private transformer(sourceFile: ts.SourceFile) {
		if (!this.transformToplevelNodes) {
			return sourceFile;
		}
		return ts.visitEachChild(sourceFile, this.transformToplevelNodes, this.context);
	}
}
