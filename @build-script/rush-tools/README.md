# rush-tools

Tools about [rush](https://rushjs.io/)

## Command line tools:

Usage:

```bash
rush-tools <command> [...args]
```

### autofix

Synchronize all projects, fix any version mismatch.

-   load version lock from `common/config/rush/common-versions.json`.
-   Ensure all third-party dependencies has same version (select newest from NPM).
-   If a package's version field in package.json was altered, update all projects depend on it, ensure they depend on current version.
-   Resolve cyclic dependencies to their newest version on NPM.

### foreach <command>

Run command in every project folder.

-   rush-tools foreach -c "bash command"
-   rush-tools foreach some/javascript/file.js # or .cjs/.mjs
-   rush-tools foreach some/typescript/file.ts # ts-node must installed

commands will have environment variables:

-   PROJECT_PATH: abosolute path to currennt folder. (always same with `pwd` at start)
-   PROJECT_NAME: package name of this project.

### check-update

Check each (dev-)depenencies version, upgrade them to latest stable version on NPM.

Need manualy run `rush update` after success.

### list <name|path|relpath>

Print list of projects, use for shell pipeline.

### register-project <folder>

Add a new project into `rush.json`.

`folder` must contains a package.json file.

## Apis:

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
