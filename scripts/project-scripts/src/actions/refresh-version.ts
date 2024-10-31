import '../include/prefix';
import { RushProject } from '@build-script/rush-tools';
import { loadJsonFile, writeJsonFileBackForce } from '@idlebox/node-json-edit';
import { inc } from 'semver';

async function main() {
	const pkgs = [];

	const rushProject = new RushProject();
	for (const project of rushProject.projects) {
		if (!project.shouldPublish) {
			continue;
		}
		const packageFile = rushProject.packageJsonPath(project);
		const pkg = await loadJsonFile(packageFile);
		if (pkg.private) {
			continue;
		}

		const version = inc(pkg.version, 'patch');
		console.log('%s : %s => %s', project.packageName, pkg.version, version);
		pkg.version = version;

		pkgs.push(pkg);
	}

	for (const pkg of pkgs) {
		await writeJsonFileBackForce(pkg);
	}
}

main().then(
	() => {
		console.log(`\x1B[38;5;10mComplete.\x1B[0m `);
	},
	(e) => {
		console.error(e.stack);
		process.exit(1);
	}
);
