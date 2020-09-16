import { basename, dirname } from "path";
import {
	CompilerOptions,
	createProgram,
	idText,
	isMetaProperty,
	isPropertyAccessExpression,
	ModuleKind,
	Node,
	Program,
	ScriptTarget,
	SourceFile,
	SyntaxKind,
	sys,
	TransformationContext,
	visitEachChild,
	VisitResult,
} from "typescript";
import { IDebug } from "./debug";
import { selfCreatedProgram } from "./preventLoop";
import { shouldMutateModuleSpecifier } from "./shouldMutateModuleSpecifier";

export function cloneProgram(
	mainProgram: Program,
	overrideOptions: CompilerOptions,
	debug: IDebug
) {
	debug(" + before createProgram");
	let options: CompilerOptions = {
		...mainProgram.getCompilerOptions(),
	};
	delete options.project;
	delete options.tsBuildInfoFile;
	delete options.plugins;
	options = {
		...options,
		target: ScriptTarget.ES2018,
		...overrideOptions,
		noEmitOnError: false,
		incremental: false,
		declarationMap: false,
		declaration: false,
		composite: false,
		module: ModuleKind.CommonJS,
	};

	const knownSources: string[] = [];
	for (const file of mainProgram.getSourceFiles()) {
		if (file.isDeclarationFile) continue;
		knownSources.push(
			file.fileName /*.replace(/\.tsx?/i, (m0: string) => `.cjs${m0}`)*/
		);
	}
	// debug('knownSources=%j', knownSources);

	const program = createProgram({
		rootNames: knownSources,
		options,
	});

	Object.defineProperty(program, selfCreatedProgram, {
		value: true,
		configurable: false,
		writable: false,
		enumerable: false,
	});

	debug(" + after createProgram");

	return program;
}

export function appendDotCjs(program: Program, debug: IDebug) {
	function writeFile(fileName: string, data: string, ...args: any[]) {
		const dir = dirname(fileName);
		const base = basename(fileName);
		const newBase = base.replace(/(?:\.jsx?)(.map$|$)/i, ".cjs$1");
		debug("   * cjs write: %s/{%s => %s}", dir, base, newBase);
		return sys.writeFile(`${dir}/${newBase}`, data, ...args);
	}

	function addCjsExtension(transformationContext: TransformationContext) {
		function visitNode(node: Node): VisitResult<Node> {
			if (
				shouldMutateModuleSpecifier(
					node.getSourceFile().fileName,
					node,
					debug,
					program
				)
			) {
				const moduleSpecifier = transformationContext.factory.createStringLiteral(
					`${node.moduleSpecifier.text}.cjs`
				);
				Object.assign(moduleSpecifier, { parent: node });
				Object.assign(node, { moduleSpecifier });
			}
			return node;
		}

		return (sourceFile: SourceFile) => {
			return visitEachChild(sourceFile, visitNode, transformationContext);
		};
	}

	// https://github.com/Jack-Works/commonjs-import.meta/blob/master/index.ts
	function updateMetaRequest(transformationContext: TransformationContext) {
		// @ts-ignore
		const { factory: ts } = transformationContext;
		function visitNode(node: Node): Node | Node[] | undefined {
			if (
				isPropertyAccessExpression(node) &&
				isMetaProperty(node.expression) &&
				idText(node.expression.name) === "meta" &&
				idText(node.name) === "url"
			) {
				return ts.createParenthesizedExpression(
					ts.createBinaryExpression(
						ts.createStringLiteral("file://"),
						SyntaxKind.PlusToken,
						ts.createIdentifier("__filename")
					)
				);
			} else {
				return visitEachChild(node, visitNode, transformationContext);
			}
		}
		return (sourceFile: SourceFile) => {
			return visitEachChild(sourceFile, visitNode, transformationContext);
		};
	}

	return (sourceFile: SourceFile) => {
		program.emit(
			program.getSourceFile(sourceFile.fileName),
			writeFile,
			undefined,
			false,
			{
				before: [addCjsExtension, updateMetaRequest],
			}
		);
	};
}
