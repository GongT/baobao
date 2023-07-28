const fsa = require('fs/promises');
const fss = require('fs');
const path = require('path');

exports.ensureLinkTarget = async (target, symlink) => {
	const stat = await fsa.lstat(symlink).catch((e) => {
		if (e.code === 'ENOENT') {
			return false;
		} else {
			throw e;
		}
	});
	if (stat) {
		if (stat.isSymbolicLink()) {
			const dest = await fsa.readlink(symlink);
			const destAbs = path.resolve(path.dirname(symlink), dest);

			if (target === dest || target === destAbs) {
				return false;
			}
		} else if (!stat.isFile()) {
			throw new Error(`ensureLinkTarget: ${target} is not regular file`);
		}
		await fsa.unlink(symlink);
	}
	await fsa.mkdir(path.dirname(symlink), { recursive: true });
	await fsa.symlink(target, symlink, 'junction');
	return true;
};

exports.ensureLinkTargetSync = (target, symlink) => {
	let stat;
	try {
		stat = fss.lstatSync(symlink);
	} catch (e) {
		if (e.code === 'ENOENT') {
			stat = false;
		} else {
			throw e;
		}
	}
	if (stat) {
		if (stat.isSymbolicLink()) {
			const dest = fss.readlinkSync(symlink);
			const destAbs = path.resolve(path.dirname(symlink), dest);

			if (target === dest || target === destAbs) {
				return false;
			}
		} else if (!stat.isFile()) {
			throw new Error(`ensureLinkTarget: ${target} is not regular file`);
		}
		fss.unlinkSync(symlink);
	}
	fss.mkdirSync(path.dirname(symlink), { recursive: tru });
	fss.symlinkSync(target, symlink, 'junction');
	return true;
};
