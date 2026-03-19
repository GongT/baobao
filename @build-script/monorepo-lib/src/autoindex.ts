/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * @build-script/autoindex - Automatic TypeScript index file generator
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/

// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore

/* common/exec.ts */
	// Identifiers (0)
/* common/find-root.ts */
	// Identifiers (2)
	export { findMonorepoRoot } from "./common/find-root.js";
	export { findMonorepoRootSync } from "./common/find-root.js";
/* common/import-package-json.ts */
	// Identifiers (2)
	export { importPackageJson } from "./common/import-package-json.js";
	export { loadPackageYaml } from "./common/import-package-json.js";
/* common/strings.ts */
	// Identifiers (1)
	export { normalizePackageName } from "./common/strings.js";
/* common/woskapce-yaml.ts */
	// Identifiers (2)
	export type { IApplyPnpmWorkspaceOptions } from "./common/woskapce-yaml.js";
	export { applyPublishWorkspace } from "./common/woskapce-yaml.js";
/* workspace/common/create.ts */
	// Identifiers (4)
	export { NotMonorepo } from "./workspace/common/create.js";
	export { createWorkspaceOrPackage } from "./workspace/common/create.js";
	export { createSimpleProject } from "./workspace/common/create.js";
	export { createWorkspace } from "./workspace/common/create.js";
/* workspace/common/deduplicate-dependency.ts */
	// Identifiers (0)
/* workspace/common/types.ts */
	// Identifiers (4)
	export { PackageManagerKind } from "./workspace/common/types.js";
	export { WorkspaceKind } from "./workspace/common/types.js";
	export type { IPackageInfo } from "./workspace/common/types.js";
	export type { IPackageInfoRW } from "./workspace/common/types.js";
/* workspace/drivers/lerna-nx.ts */
	// Identifiers (2)
	export { lernaListProjects } from "./workspace/drivers/lerna-nx.js";
	export { nxListProjects } from "./workspace/drivers/lerna-nx.js";
/* workspace/drivers/npm.ts */
	// Identifiers (1)
	export { npmListProjects } from "./workspace/drivers/npm.js";
/* workspace/drivers/pnpm.ts */
	// Identifiers (1)
	export { pnpmListProjects } from "./workspace/drivers/pnpm.js";
/* workspace/drivers/rush.ts */
	// Identifiers (1)
	export { rushListProjects } from "./workspace/drivers/rush.js";
/* workspace/drivers/yarn.ts */
	// Identifiers (1)
	export { yarnListProjects } from "./workspace/drivers/yarn.js";
/* workspace/index.ts */
	// Identifiers (4)
	export { WorkspaceBase } from "./workspace/index.js";
	export { MonorepoWorkspace } from "./workspace/index.js";
	export { SimplePackage } from "./workspace/index.js";
	export type { IDecoupleMethod } from "./workspace/index.js";