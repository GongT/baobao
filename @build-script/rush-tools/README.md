# rush-tools

Tools about [@microsoft/rush](https://rushjs.io/)

# CLI:

Usage:

```bash
rush-tools <command> [...args]
```

## commands:

### fix

Synchronize all projects, fix any version mismatch.

-   load version lock from `common/config/rush/common-versions.json`.
-   Ensure all third-party dependencies has same version (select newest from NPM).
-   If a package's version field in package.json was altered, update all projects depend on it, ensure they depend on current version.
-   Resolve cyclic dependencies to their newest version on NPM.

### foreach <command>

Run command in every project folder.

1.  rush-tools foreach -c "bash command"
1.  rush-tools foreach some/javascript/file.js # or .cjs/.mjs
1.  rush-tools foreach some/typescript/file.ts # ts-node must installed

commands will have environment variables:

-   `PROJECT_PATH`: abosolute path to currennt folder. (always same with `pwd` at start)
-   `PROJECT_NAME`: package name of this project.

extra (fixed) arguments allowed for script

### upgrade

Check each (dev-)depenencies version of each project, upgrade them to latest stable version on NPM.

Auto run `rush update` after success, set `--skip-update` to disable this.

### list <name|path|relpath>

Print list of projects, use for shell pipeline.

### register <folder/path>

Add a new project into `rush.json`.

`folder` must contains a package.json file.

### create-tasks

Create watch task for each project in VSCode tasks.json

### create-yarn

Create yarn workspace file in the root directory

### create-vscode

Create VSCode workspace file in the root directory

### update

1. run `rush update`
1. run`rush update-autoinstaller` in each autoinstaller folder.

### link-local

Link "bin"s from each project to `common/temp/bin`

(You may need modify `PATH` to actually use this feature)

# API:

For detais, see [docs/package-public.d.ts](./docs/package-public.d.ts)

### eachProject(folder = process.cwd())

List all projects.

### findRushJson[Sync], loadConfig[Sync], findRushRootPath[Sync] (from = process.cwd())

Find rush.json file, or it's folder. Read content of rush.json.

### buildProjects([opts: IBuildProjectOptions], builder: IProjectCallback)

Simulate the `rush build` command. Call builder for each project, in thier build order.

### overallOrder()

like `eachProject` but sort projects with build order.

### class RushProject

See [docs/package-public.d.ts](./docs/package-public.d.ts).
