## API Report File for "@build-script/typescript-transformer-common"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

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
import { default as ts_2 } from 'typescript';

// Warning: (ae-missing-release-tag) "collectImportInfo" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function collectImportInfo(sourceFile: ts.SourceFile, nodes: ValidImportDeclaration[], typeChecker: ts.TypeChecker): IImportInfoResult;

// Warning: (tsdoc-escape-right-brace) The "}" character should be escaped using a backslash to avoid confusion with a TSDoc inline tag
// Warning: (tsdoc-malformed-inline-tag) Expecting a TSDoc tag starting with "{@"
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (ae-missing-release-tag) "createDependencies" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function createDependencies(path: string): IDependencyMap;

// Warning: (ae-missing-release-tag) "createDiagnosticMissingImport" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function createDiagnosticMissingImport(node: ValidImportOrExportDeclaration): string;

// Warning: (ae-missing-release-tag) "createProgramPlugin" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function createProgramPlugin(plugin: IPluginFunction): IPluginFunction;

// Warning: (ae-missing-release-tag) "dumpFlags" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function dumpFlags(flags: number, def: any): void;

// Warning: (ae-missing-release-tag) "dumpFlagStrings" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function dumpFlagStrings(flags: number, def: any, sp?: string): string;

// Warning: (ae-missing-release-tag) "dumpNode" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function dumpNode(node: Node | Node[], options?: InspectOptions): void;

// Warning: (ae-missing-release-tag) "extensionIsKindOfScriptFile" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function extensionIsKindOfScriptFile(f: string): boolean;

// Warning: (ae-forgotten-export) The symbol "PackageJson" needs to be exported by the entry point _export_all_in_one_index.d.ts
// Warning: (ae-missing-release-tag) "findPackageFileExtension" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function findPackageFileExtension(pkg: PackageJson, wantModule: boolean): string;

// Warning: (ae-missing-release-tag) "formatMyDiagnostic" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function formatMyDiagnostic(node: ts_2.Node, message: string, ...args: any[]): string;

// Warning: (ae-missing-release-tag) "getAllImports" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function getAllImports(sourceFile: ts.SourceFile): ValidImportDeclaration[];

// Warning: (ae-missing-release-tag) "getDebug" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function getDebug(verbose: boolean): IDebug;

// Warning: (ae-missing-release-tag) "getImportedName" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function getImportedName(node: ValidImportOrExportDeclaration): string;

// Warning: (ae-missing-release-tag) "IContextFunction" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IContextFunction {
    // (undocumented)
    (transformationContext: TransformationContext): ISourcefileFunction;
}

// Warning: (ae-missing-release-tag) "IDebug" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IDebug {
    // (undocumented)
    (message?: any, ...optionalParams: any[]): void;
}

// Warning: (ae-missing-release-tag) "IDependencyMap" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type IDependencyMap = Record<string, any>;

// Warning: (ae-missing-release-tag) "idToString" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function idToString(id: Identifier): string;

// Warning: (ae-missing-release-tag) "IExtraOpts" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IExtraOpts {
    // (undocumented)
    outDir: string;
    // (undocumented)
    packageJsonPath: string;
    // (undocumented)
    rootDir: string;
}

// Warning: (ae-missing-release-tag) "IImportInfo" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type IImportInfo = IImportInfoModule | IImportInfoCommonjs;

// Warning: (ae-missing-release-tag) "IImportInfoCommonjs" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IImportInfoCommonjs extends IImportInfoResolveSuccess {
    // (undocumented)
    type: ResolveResultType.commonjs;
}

// Warning: (ae-forgotten-export) The symbol "IImportInfoBase" needs to be exported by the entry point _export_all_in_one_index.d.ts
// Warning: (ae-missing-release-tag) "IImportInfoMissing" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IImportInfoMissing extends IImportInfoBase {
    // (undocumented)
    type: ResolveResultType.missing;
}

// Warning: (ae-missing-release-tag) "IImportInfoModule" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IImportInfoModule extends IImportInfoResolveSuccess {
    // (undocumented)
    type: ResolveResultType.module;
}

// Warning: (ae-missing-release-tag) "IImportInfoProjectSource" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IImportInfoProjectSource extends IImportInfoResolveSuccess {
    // (undocumented)
    type: ResolveResultType.typescript;
}

// Warning: (ae-missing-release-tag) "IImportInfoResolveSuccess" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IImportInfoResolveSuccess extends IImportInfoBase {
    // (undocumented)
    fsPath: string;
    // (undocumented)
    nodeResolve: string;
    // (undocumented)
    sourceKind: SourceProjectKind;
}

// Warning: (ae-forgotten-export) The symbol "IImportNames" needs to be exported by the entry point _export_all_in_one_index.d.ts
// Warning: (ae-missing-release-tag) "IImportInfoResult" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type IImportInfoResult = Map<ValidImportDeclaration, IImportNames>;

// Warning: (ae-missing-release-tag) "IImportTargetInfo" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IImportTargetInfo {
    // (undocumented)
    filePath: string;
    // (undocumented)
    packageName: string;
}

// Warning: (ae-missing-release-tag) "IPluginFunction" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface IPluginFunction {
    // (undocumented)
    (program: Program, pluginOptions: any, extraOptions: IExtraOpts): IContextFunction;
}

// Warning: (ae-missing-release-tag) "isExport" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isExport(node: ts.Node): node is ValidExportDeclaration;

// Warning: (ae-missing-release-tag) "isImport" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isImport(node: ts.Node): node is ValidImportDeclaration;

// Warning: (ae-missing-release-tag) "isImportExport" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isImportExport(node: ts.Node): node is ValidImportOrExportDeclaration;

// Warning: (ae-missing-release-tag) "isImportFromNodeModules" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isImportFromNodeModules(node: string | ValidImportOrExportDeclaration): boolean;

// Warning: (ae-missing-release-tag) "isImportNodeBuiltins" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function isImportNodeBuiltins(node: string | ValidImportOrExportDeclaration): boolean;

// Warning: (ae-missing-release-tag) "ISourcefileFunction" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export interface ISourcefileFunction {
    // (undocumented)
    (sourceFile: SourceFile): SourceFile;
}

// Warning: (ae-missing-release-tag) "missing" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function missing(specifier: string): IImportInfoMissing;

// Warning: (ae-missing-release-tag) "nameToString" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function nameToString(name: Identifier | StringLiteral): string;

// Warning: (ae-missing-release-tag) "nodeDiagnosticPosition" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function nodeDiagnosticPosition(node: ValidImportOrExportDeclaration): string;

// Warning: (ae-missing-release-tag) "prettyKind" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function prettyKind(node: Node): string;

// Warning: (ae-missing-release-tag) "printMyDiagnostic" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function printMyDiagnostic(node: ts_2.Node, message: string, ...args: any[]): void;

// Warning: (tsdoc-escape-greater-than) The ">" character should be escaped using a backslash to avoid confusion with an HTML tag
// Warning: (tsdoc-malformed-html-name) Invalid HTML element: An HTML name must be an ASCII letter followed by zero or more letters, digits, or hyphens
// Warning: (ae-missing-release-tag) "replaceImportExportSpecifier" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function replaceImportExportSpecifier(node: ValidImportOrExportDeclaration, newSpecifier: string): ValidImportOrExportDeclaration;

// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (ae-missing-release-tag) "resolveModule" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function resolveModule(wantType: 'module' | 'commonjs', packageJsonFilePath: string, file?: string, useModuleField?: boolean): string | null;

// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (ae-missing-release-tag) "resolveModuleNative" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function resolveModuleNative(packageJsonFilePath: string, file?: string): string | null;

// Warning: (ae-missing-release-tag) "resolveProjectFile" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export function resolveProjectFile(node: ValidImportOrExportDeclaration, program?: Program): IImportInfoProjectSource | IImportInfoMissing;

// Warning: (ae-missing-release-tag) "ResolveResultType" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const enum ResolveResultType {
    // (undocumented)
    commonjs = "commonjs",
    // (undocumented)
    missing = "missing",
    // (undocumented)
    module = "module",
    // (undocumented)
    typescript = "typescript"
}

// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (ae-missing-release-tag) "resolveTypescriptModule" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function resolveTypescriptModule(node: ValidImportOrExportDeclaration, packageJsonPath: string): IImportInfo | IImportInfoMissing;

// Warning: (ae-missing-release-tag) "SourceProjectKind" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export const enum SourceProjectKind {
    // (undocumented)
    external = "external",
    // (undocumented)
    internal = "internal"
}

// Warning: (tsdoc-at-sign-in-word) The "@" character looks like part of a TSDoc tag; use a backslash to escape it
// Warning: (tsdoc-at-sign-in-word) The "@" character looks like part of a TSDoc tag; use a backslash to escape it
// Warning: (ae-missing-release-tag) "splitPackageName" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function splitPackageName(path: string): {
    packageName: string;
    filePath: string;
};

// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (tsdoc-param-tag-missing-hyphen) The @param block should be followed by a parameter name and then a hyphen
// Warning: (ae-missing-release-tag) "testProjectFile" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public
export function testProjectFile(debug: IDebug, source: string, node: ValidImportOrExportDeclaration, program?: Program): boolean;

// Warning: (ae-forgotten-export) The symbol "valid" needs to be exported by the entry point _export_all_in_one_index.d.ts
// Warning: (ae-missing-release-tag) "ValidExportDeclaration" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type ValidExportDeclaration = ExportDeclaration & valid;

// Warning: (ae-missing-release-tag) "ValidImportDeclaration" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type ValidImportDeclaration = ImportDeclaration & valid;

// Warning: (ae-missing-release-tag) "ValidImportOrExportDeclaration" is exported by the package, but it is missing a release tag (@alpha, @beta, @public, or @internal)
//
// @public (undocumented)
export type ValidImportOrExportDeclaration = ValidImportDeclaration | ValidExportDeclaration;


// (No @packageDocumentation comment for this package)

```
