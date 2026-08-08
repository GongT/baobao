const { resolveOutput } = await import('../scripts/build.js');
const { dispose, getLoadedFiles, overrideImportFile } = await import(resolveOutput('exports.js'));
export { dispose, getLoadedFiles, overrideImportFile };
