/// <reference types="node" />
import { ExportDeclaration } from 'typescript';
import { Identifier } from 'typescript';
import { ImportDeclaration } from 'typescript';
import { InspectOptions } from 'util';
import { Node } from 'typescript';
import { Program } from 'typescript';
import { SourceFile } from 'typescript';
import { StringLiteral } from 'typescript';
import { TransformationContext } from 'typescript';
import * as ts from 'typescript';

export declare function collectImportInfo(sourceFile: ts.SourceFile, nodes: ValidImportDeclaration[], typeChecker: ts.TypeChecker): IImportNames;

/** @deprecated */
export declare function collectImportNames(node: ValidImportOrExportDeclaration): string[];

/**
 * convert dependencies to { name: true }
 * @param path to a package.json
 */
export declare function createDependencies(path: string): IDependencyMap;

export declare function createDiagnosticMissingImport(node: ValidImportOrExportDeclaration): string;

export declare function createProgramPlugin(plugin: IPluginFunction): IPluginFunction;

export declare function dumpFlags(flags: number, def: any): void;

export declare function dumpNode(node: Node, options?: InspectOptions): void;

export declare function extensionIsKindOfScriptFile(f: string): boolean;

export declare function findPackageFileExtension(pkg: PackageJson, wantModule: boolean): string;

export declare function getAllImports(sourceFile: ts.SourceFile): ValidImportDeclaration[];

export declare function getDebug(verbose: boolean): IDebug;

export declare function getImportedName(node: ValidImportOrExportDeclaration): string;

export declare interface IContextFunction {
    (transformationContext: TransformationContext): ISourcefileFunction;
}

export declare interface IDebug {
    (message?: any, ...optionalParams: any[]): void;
}

export declare type IDependencyMap = Record<string, any>;

export declare function idToString(id: Identifier): string;

declare type IExportDefine = IExportDefineObj | string;

declare interface IExportDefineObj {
    import?: string;
    require?: string;
    default?: string;
}

declare interface IExportMap {
    [path: string]: IExportDefine;
}

export declare interface IExtraOpts {
    rootDir: string;
    outDir: string;
    packageJsonPath: string;
}

export declare type IImportInfo = IImportInfoModule | IImportInfoCommonjs;

declare interface IImportInfoBase {
    types?: string[];
    identifiers?: string[];
    specifier: string;
}

export declare interface IImportInfoCommonjs extends IImportInfoResolveSuccess {
    type: 'commonjs';
}

export declare interface IImportInfoMissing extends IImportInfoBase {
    type: 'missing';
}

export declare interface IImportInfoModule extends IImportInfoResolveSuccess {
    type: 'module';
}

export declare interface IImportInfoResolveSuccess extends IImportInfoBase {
    identifiers: string[];
    nodeResolve: string;
    fsPath: string;
}

export declare interface IImportInfoTypeSource extends IImportInfoResolveSuccess {
    type: 'typescript';
}

export declare interface IImportNames {
    types: string[];
    values: string[];
}

export declare interface IImportTargetInfo {
    packageName: string;
    filePath: string;
}

export declare interface IPluginFunction {
    (program: Program, pluginOptions: any, extraOptions: IExtraOpts): IContextFunction;
}

export declare function isExport(node: ts.Node): node is ValidExportDeclaration;

export declare function isImport(node: ts.Node): node is ValidImportDeclaration;

export declare function isImportExport(node: ts.Node): node is ValidImportOrExportDeclaration;

export declare function isImportFromNodeModules(node: string | ValidImportOrExportDeclaration): boolean;

export declare function isImportNodeBuiltins(node: string | ValidImportOrExportDeclaration): boolean;

export declare interface ISourcefileFunction {
    (sourceFile: SourceFile): SourceFile;
}

export declare function missing(specifier: string): IImportInfoMissing;

export declare function nameToString(name: Identifier | StringLiteral): string;

/**
 * Create something like "xxx/yyy/zzz.ts:111:222"
 */
export declare function nodeDiagnosticPosition(node: ValidImportOrExportDeclaration): string;

declare interface PackageJson {
    type?: 'module' | 'commonjs';
    main?: string;
    module?: string;
    exports?: IExportMap;
}

/**
 * Replace specifier part of a import/export statement
 *
 * import x from "--> SPECIFIER <--"
 */
export declare function replaceImportExportSpecifier(node: ValidImportOrExportDeclaration, newSpecifier: string): ValidImportOrExportDeclaration;

/**
 * resolve module file in target package
 * emulate nodejs version 14+'s
 * @param wantType resolve type, esm or cjs
 * @param packageJsonFilePath  absolute path to package's package.json
 * @param file resolve file inside package
 * @param useModuleField if true, use "module" field when package type=commonjs
 */
export declare function resolveModule(wantType: 'module' | 'commonjs', packageJsonFilePath: string, file?: string, useModuleField?: boolean): string | null;

/**
 * get absolute js file location by using node's require
 * @param packageJsonFilePath resolve start point
 * @param file  relative file to resolve
 */
export declare function resolveModuleNative(packageJsonFilePath: string, file?: string): string | null;

export declare function resolveProjectFile(node: ValidImportOrExportDeclaration, program?: Program): Omit<IImportInfoTypeSource, 'identifiers'> | IImportInfoMissing;

/**
 * resolve import info from node_modules
 * @param packageJsonPath CURRENT project's package.json
 */
export declare function resolveTypescriptModule(node: ValidImportOrExportDeclaration, packageJsonPath: string): Omit<IImportInfo, 'identifiers'> | IImportInfoMissing;

/**
 * split "@some/package/file.js" into "@some/package" and "file.js"
 */
export declare function splitPackageName(path: string): {
    packageName: string;
    filePath: string;
};

/**
 * check an import statement, check if included in program, not an external/module file
 * @param debug logger
 * @param source which file contains this import
 * @param node a statement to check
 * @param program if set, limit project files by typescript, not only filesystem
 */
export declare function testProjectFile(debug: IDebug, source: string, node: ValidImportOrExportDeclaration, program?: Program): boolean;

declare type valid = {
    moduleSpecifier: StringLiteral;
};

export declare type ValidExportDeclaration = ExportDeclaration & valid;

export declare type ValidImportDeclaration = ImportDeclaration & valid;

export declare type ValidImportOrExportDeclaration = ValidImportDeclaration | ValidExportDeclaration;

export { }
