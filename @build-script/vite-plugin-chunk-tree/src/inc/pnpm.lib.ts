export interface PnpmDependencyNode {
	from: string;
	version: string;
	path: string;
	dependencies?: Record<string, PnpmDependencyNode>;
}

export type PnpmDependTree = Record<string, PnpmDependencyNode>;

export interface PnpmListItem {
	name?: string;
	path: string;
	dependencies?: PnpmDependTree;
}
