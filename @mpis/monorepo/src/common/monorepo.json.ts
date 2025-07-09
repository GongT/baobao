export interface IBuildConfigJson {
	$schema: string;
	dependencies?: readonly string[];
	removeDependencies?: readonly string[];
}
