import { logger } from '@idlebox/cli';
import { loadJsonFile } from '@idlebox/json-edit';
import { createTempFile, findUpUntilSync, shutdown } from '@idlebox/node';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { ClassDeclaration, Project, SyntaxKind, type InterfaceDeclaration, type Symbol } from 'ts-morph';
import { fatal } from './error.js';
import { readInterface } from './read-interface.js';

const assetsDir = resolve(import.meta.dirname, '../../assets');
const apiExtractorJsonTemplate = resolve(assetsDir, 'api-extractor.json');
const template = await loadJsonFile(apiExtractorJsonTemplate);

interface Context {
	readonly dtsFile: string;
	readonly sourceFile: string;
	readonly tsconfig: string;
	readonly packageRoot: string;
}

const randomId = randomBytes(8).toString('hex');

function prepareContext(dtsFile: string): Context {
	// 准备阶段
	const inputDtsMapPath = `${dtsFile}.map`;
	const { sources } = JSON.parse(readFileSync(inputDtsMapPath, 'utf-8'));
	if (!sources[0]) throw new Error(`无法从 ${inputDtsMapPath} 中找到源文件`);

	const sourceFile = resolve(dtsFile, '..', sources[0]);
	if (!existsSync(sourceFile)) throw new Error(`源文件 ${sourceFile} 不存在`);

	const tsconfig = findUpUntilSync({ file: 'tsconfig.json', from: dirname(sourceFile) });
	if (!tsconfig) throw new Error(`无法找到 ${sourceFile} 对应的 tsconfig.json 文件`);

	const packagePath = findUpUntilSync({ file: 'package.json', from: dirname(tsconfig) });
	if (!packagePath) throw new Error(`无法找到 ${tsconfig} 对应的 package.json 文件`);
	const packageRoot = dirname(packagePath);

	return {
		dtsFile,
		packageRoot,
		sourceFile,
		tsconfig,
	};
}

/**
 * 从源文件中读取类定义，如果只有一个则无条件使用，否则寻找继承自 WebsocketServer 的类
 */
function readEntryClass(proj: Project, ctx: Context) {
	const source = proj.addSourceFileAtPath(ctx.dtsFile);

	const foundClasses: ClassDeclaration[] = [];
	for (const [_name, decls] of source.getExportedDeclarations()) {
		for (const decl of decls) {
			const isClass = decl.isKind(SyntaxKind.ClassDeclaration);
			if (!isClass) continue;

			foundClasses.push(decl);
		}
	}

	if (foundClasses.length === 0) {
		throw new Error(`在 ${ctx.dtsFile} 中没有找到导出的类`);
	} else {
		logger.debug`导出${foundClasses.length}个类: ${foundClasses.map((c) => c.getName()).join(', ')}`;
		const receiverClass = foundClasses.map(walkWsReceiverExtends).filter((list) => list.length > 0);

		logger.debug`找到目标: ${receiverClass.length}`;

		if (receiverClass.length !== 1) throw new Error(`在 ${ctx.sourceFile} 中找到多个导出的类，但无法确定哪个是入口，应有且仅有一个类型继承 WebsocketServer`);

		return receiverClass[0];
	}
}

export function walkWsReceiverExtends(classDecl: ClassDeclaration) {
	const declList: ClassDeclaration[] = [classDecl];
	for (const parent of walkExtends(classDecl)) {
		const symb = parent?.getType().getSymbol();
		if (isSymbolWebsocketServer(symb)) {
			return declList;
		} else if (parent?.getText() === 'WebsocketServer') {
			logger.warn`发现类型 ${classDecl.getName()} 继承自 WebsocketServer，但未能解析WebsocketServer的引用`;
			return declList;
		}

		declList.push(parent);
	}
	return [];
}

export function analyzeExport(dtsFile: string) {
	logger.info`分析文件 relative<${dtsFile}> 中的导出...`;

	const ctx = prepareContext(dtsFile);
	logger.debug`root: long<${ctx.packageRoot}>`;
	logger.debug`source: relative<${ctx.sourceFile}>`;
	logger.debug`tsconfig: relative<${ctx.tsconfig}>`;

	const tsProj = new Project({
		skipAddingFilesFromTsConfig: true,
		tsConfigFilePath: ctx.tsconfig,
	});

	const classes = readEntryClass(tsProj, ctx);
	const entryName = classes[0].getName();
	if (!entryName) {
		fatal(classes[0], `无法识别入口类的名称，不支持未命名类型`);
	}

	logger.log`使用导出符号: ${entryName} | ${classes
		.slice(1)
		.map((item) => item.getName())
		.join(' <- ')}`;

	const pushEvent = findPushEvent(classes);
	if (!pushEvent) {
		fatal(classes[0], `导出的类型上未找到 pushEvents 属性`);
	}

	const wrapperCode = `import { ${entryName} } from "./${basename(ctx.sourceFile, '.ts')}.js";
export class ${entryName}_${randomId} extends ${entryName} {}
`;

	const wrapperFile = resolve(dirname(dtsFile), `wrapper.${randomId}.d.ts`);
	createTempFile(wrapperFile);
	writeFileSync(wrapperFile, wrapperCode);
	const extractorOutput = invoke(wrapperFile, ctx);

	const code = removeUnPublicMembers(tsProj, extractorOutput);
	return {
		project: tsProj,
		code: code,
		entryName: entryName,
		pushEvent: pushEvent,
	} as const;
}

function findPushEvent(classes: readonly ClassDeclaration[]) {
	for (const classDecl of classes) {
		const prop = classDecl.getInstanceProperty('pushEvents');
		if (!prop) continue;

		const typeSymbol = prop.getType().getSymbol();
		if (typeSymbol) {
			// find the declaration and location
			const decls = typeSymbol.getDeclarations();
			if (decls.length === 0) {
				fatal(classDecl, `无法解析 pushEvents 的类型: 定义为空`);
			}
			const decl = decls[0];
			if (!decl.isKind(SyntaxKind.ClassDeclaration) && !decl.isKind(SyntaxKind.InterfaceDeclaration)) {
				fatal(classDecl, `无法解析 pushEvents 的类型: ${decl.getKindName()} 不是 class / interface`);
			}

			return readInterface(decl);
		} else {
			fatal(classDecl, `无法解析 pushEvents 的类型: 无符号定义`);
		}
	}
	return undefined;
}

function isSymbolWebsocketServer(symb: undefined | Symbol) {
	if (symb) {
		if (symb.getFullyQualifiedName().endsWith('/receiver-shape".WebsocketServer')) {
			return true;
		}
	}
	return false;
}

function isDirectChildOfWebsocketServer(classDecl: ClassDeclaration) {
	const parent = classDecl.getBaseClass();
	const symb = parent?.getType().getSymbol();
	if (isSymbolWebsocketServer(symb)) {
		return true;
	} else if (parent?.getText() === 'WebsocketServer') {
		logger.warn`发现类型 ${classDecl.getName()} 继承自 WebsocketServer，但未能解析WebsocketServer的引用`;
		return true;
	}
	return false;
}

function walkExtends(decl: ClassDeclaration): Generator<ClassDeclaration>;
function walkExtends(decl: InterfaceDeclaration): Generator<InterfaceDeclaration | ClassDeclaration>;
function walkExtends(decl: InterfaceDeclaration | ClassDeclaration): Generator<InterfaceDeclaration | ClassDeclaration>;
function* walkExtends(decl: InterfaceDeclaration | ClassDeclaration): Generator<InterfaceDeclaration | ClassDeclaration> {
	if (decl.isKind(SyntaxKind.ClassDeclaration)) {
		let clsDec = decl;

		while (true) {
			const parent = clsDec.getBaseClass();
			if (!parent) break;
			yield parent;
			clsDec = parent;
		}
		return;
	}

	const parents = decl.getBaseDeclarations();
	if (!parents.length) return;

	for (const parent of parents) {
		if (parent.isKind(SyntaxKind.TypeAliasDeclaration)) {
			throw new Error('不支持接口继承类型别名');
		}
		yield parent;

		yield* walkExtends(parent);
	}
}

export function* walkExtendsWithSelf(classDecl: ClassDeclaration | InterfaceDeclaration) {
	yield classDecl;
	yield* walkExtends(classDecl);
}

/**
 * 移除 protected、private 成员
 * 删除对 WebsocketServer 的引用
 */
function removeUnPublicMembers(proj: Project, code: string) {
	const apiFile = proj.addSourceFileAtPath(code);
	for (const classDecl of apiFile.getClasses()) {
		if (isDirectChildOfWebsocketServer(classDecl)) {
			classDecl.removeExtends();
		}
		for (const prop of classDecl.getProperties()) {
			// if (prop.getScope() !== 'public') {
			prop.remove();
			// }
		}
		for (const method of classDecl.getMethods()) {
			if (method.getScope() !== 'public') {
				method.remove();
			}
		}
	}

	const file = apiFile.fixUnusedIdentifiers();

	for (const classDecl of file.getClasses()) {
		if (classDecl.getName()?.endsWith(`_${randomId}`)) {
			classDecl.remove();
			break;
		}
	}

	return file.getFullText();
}

function invoke(wrapperFile: string, { dtsFile, tsconfig, packageRoot }: Context) {
	const extractorJson = resolve(dtsFile, '..', `api-extractor.${randomId}.json`);
	createTempFile(extractorJson);
	const extractorOutput = resolve(dtsFile, '..', `temp.${randomId}.d.ts`);
	createTempFile(extractorOutput);

	template.mainEntryPointFilePath = wrapperFile;
	template.compiler.tsconfigFilePath = tsconfig;
	template.dtsRollup.publicTrimmedFilePath = extractorOutput;
	writeFileSync(extractorJson, JSON.stringify(template, null, '\t'));

	const pkgJsonPath = resolve(packageRoot, 'package.json');
	const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
	if (!pkgJson.name) {
		pkgJson.name = '@internal/unknown_package';
	}
	const cfg = ExtractorConfig.loadFile(extractorJson);
	const extractorConfig = ExtractorConfig.prepare({
		configObject: cfg,
		configObjectFullPath: extractorJson,
		packageJsonFullPath: pkgJsonPath,
		packageJson: pkgJson,
		projectFolderLookupToken: packageRoot,
	});

	const extractorResult = Extractor.invoke(extractorConfig, {
		localBuild: false,
		showVerboseMessages: true,
	});

	if (!extractorResult.succeeded) {
		logger.error`API Extractor 执行时出现 ${extractorResult.errorCount} 个错误和 ${extractorResult.warningCount} 个警告`;
		shutdown(1);
	}

	logger.log`API Extractor 执行成功`;
	return extractorOutput;
}
