import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import { existsSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { overwriteSafeMark, writeFileIfChangeSafeSync } from '../inc/fs.js';
import type { IPackageJson } from '../inc/package.js';

export const PLUGIN_NAME = 'make-dualstack-package';

export default class MakeDualStackPlugin {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, _options?: undefined): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async (_opt) => {
			const pkgJsonPath = resolve(configuration.buildFolderPath, 'package.json');
			try {
				const pkgJson = require(pkgJsonPath);
				basicCheck(pkgJsonPath, pkgJson);
				actionCjs(session, configuration.buildFolderPath, pkgJson);
				actionEsm(session, configuration.buildFolderPath, pkgJson);
			} catch (e: any) {
				session.logger.terminal.writeErrorLine(`In file "${pkgJsonPath}":`);
				session.logger.emitError(e);
			}
		});
	}
}

module.exports.PLUGIN_NAME = PLUGIN_NAME;

function basicCheck(pkgJsonPath: string, pkgJson: IPackageJson) {
	if (!pkgJson.exports?.['./package.json']) {
		throw new Error(`missing "package.json" in "exports"`);
	}

	const exported1 = pkgJson.exports?.['.'];
	if (typeof exported1 !== 'object') throw new Error(`missing "exports[.]"`);
	const exported = exported1;

	function existsAndBasicSame(mField: 'main' | 'module', eField: string) {
		const f1 = pkgJson[mField];
		const f2 = exported[eField];

		if (!f1) throw new Error(`missing "${mField}"`);
		if (!f2) throw new Error(`missing "exports.${eField}"`);

		if (!f1.endsWith('.js')) throw new Error(`"${mField}" target must be ".js" (current: ${f1})`);
		if (!f2.endsWith('.js')) throw new Error(`"exports.${eField}" must be ".js" (current: ${f2})`);

		if (f1 !== f2) throw new Error(`"${mField}"(${f1}) and "exports.${eField}"(${f2}) must have same value`);
	}

	existsAndBasicSame('main', 'require');
	existsAndBasicSame('module', 'import');

	if (pkgJson.types || pkgJson.typings || exported.types) {
		throw new Error(`forbidden "types" field in ${pkgJsonPath}`);
	}
}

function actionCjs(session: IHeftTaskSession, rootDir: string, pkgJson: IPackageJson) {
	let ch;

	const absoluteEntry = resolve(rootDir, pkgJson.main);
	if (!existsSync(absoluteEntry)) throw new Error(`compile result file: ${absoluteEntry} does not exists.`);

	// const exported = pkgJson.exports['.']! as Record<string, string>;

	// const shimEntry = resolve(rootDir, exported.require!);
	// const rel = relativePath(dirname(shimEntry), absoluteEntry);
	// ch = writeFileIfChangeSafeSync(
	// 	shimEntry,
	// 	`${overwriteSafeMark}\nmodule.exports = require(${JSON.stringify(rel)});\n`
	// );
	// if (ch) session.logger.terminal.writeLine(`commonjs shim entry created.`);

	// writeFileIfChangeSafeSync(shimEntry.replace(/cjs$/, 'd.cts'), `${overwriteSafeMark}\nexport * from './api.js';\n`);

	const shadowPackagePath = resolve(rootDir, 'lib/cjs', 'package.json');
	ch = writeFileIfChangeSafeSync(
		shadowPackagePath,
		JSON.stringify({
			alert: overwriteSafeMark,
			type: 'commonjs',
			exports: relativePath(dirname(shadowPackagePath), absoluteEntry),
		})
	);
	if (ch) session.logger.terminal.writeLine('commonjs package created.');
}

function actionEsm(session: IHeftTaskSession, rootDir: string, pkgJson: IPackageJson) {
	let ch;

	const absoluteEntry = resolve(rootDir, pkgJson.module);
	if (!existsSync(absoluteEntry)) throw new Error(`compile result file: ${absoluteEntry} does not exists.`);

	// const exported = pkgJson.exports['.']! as Record<string, string>;

	// const shimEntry = resolve(rootDir, exported.import!);
	// const rel = relativePath(dirname(shimEntry), absoluteEntry);
	// ch = writeFileIfChangeSafeSync(shimEntry, `${overwriteSafeMark}\nexport * from ${JSON.stringify(rel)};\n`);
	// if (ch) session.logger.terminal.writeLine(`module shim entry created.`);

	// writeFileIfChangeSafeSync(shimEntry.replace(/mjs$/, 'd.mts'), `${overwriteSafeMark}\nexport * from './api.js';\n`);

	const shadowPackagePath = resolve(rootDir, 'lib/esm', 'package.json');
	ch = writeFileIfChangeSafeSync(
		shadowPackagePath,
		JSON.stringify({
			alert: overwriteSafeMark,
			type: 'module',
			exports: relativePath(dirname(shadowPackagePath), absoluteEntry),
		})
	);
	if (ch) session.logger.terminal.writeLine('module package created.');
}

function relativePath(from: string, to: string) {
	return `./${relative(from, to).replace(/\\/g, '/')}`;
}
