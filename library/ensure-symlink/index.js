const fs = require('fs-extra');
const path = require('path');

exports.ensureLinkTarget = async (target, symlink) => {
	const stat = await fs.lstat(symlink).catch(e => {
		if (e.code === 'ENOENT') {
			return false;
		} else {
			throw e;
		}
	});
	if (stat) {
		if (stat.isSymbolicLink()) {
			const dest = await fs.readlink(symlink);
			const destAbs = path.resolve(path.dirname(symlink), dest);

			if (target === dest || target === destAbs) {
				return false;
			}
		}
		await fs.remove(symlink);
	}
	await fs.mkdirp(path.dirname(symlink));
	await fs.symlink(target, symlink, 'junction');
	return true;
};

exports.ensureLinkTargetSync = (target, symlink) => {
	let stat;
	try {
		stat = fs.lstatSync(symlink);
	} catch (e) {
		if (e.code === 'ENOENT') {
			stat = false;
		} else {
			throw e;
		}
	}
	if (stat) {
		const stat = fs.lstatSync(symlink);
		if (stat.isSymbolicLink()) {
			const dest = fs.readlinkSync(symlink);
			const destAbs = path.resolve(path.dirname(symlink), dest);

			if (target === dest || target === destAbs) {
				return false;
			}
		}
		fs.removeSync(symlink);
	}
	fs.mkdirpSync(path.dirname(symlink));
	fs.symlinkSync(target, symlink, 'junction');
	return true;
};
