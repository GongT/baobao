// network full url: schema://xxxxx
const schema = /^[a-z]{2,}:\/\//i;
// unc: \?\UNC\
const unc = /^[/\\]{2,}[?.][/\\]UNC[/\\]/i;
// win32 special: \?\c:\  or \?\Volume{...}
const winSp = /^[/\\]{2,}[?.][/\\]([a-z]:[/\\]|Volume{[^}]+}\/?)/i;
// basic win: d:\path
const winLetter = /^[a-z]:[/\\]/i;
// samba: \\xxx\yyy
const doubleSlash = /^[/\\]{2,}[^/\\]/i;

const anySlash = /[/\\]/;
const startingSlashes = /^[/\\]+/;

/** @deprecated */
export enum PathKind {
	url = 0,
	unc = 1,
	win = 2,
	cifs = 3,
	unix = 4,
	relative = 5,
}

/** @deprecated */
export interface IPathInfo {
	kind: PathKind;
	/**
	 * 根目录部分
	 */
	prefix?: string;
	path: string;
	url?: URL;
}

/** @deprecated */
export function analyzePath(p: string) {
	const inp = p;
	let r: IPathInfo;
	if (schema.test(p)) {
		const u = new URL(p);
		r = {
			kind: PathKind.url,
			prefix: `${u.protocol}//${u.host}`,
			path: u.pathname.slice(1),
			url: u,
		};
	} else if (unc.test(p)) {
		p = p.replace(unc, '').replace(startingSlashes, '');
		const i = anySlash.exec(p)?.index ?? -1;
		if (i <= 0) throw new Error(`invalid unc path: ${inp}`);

		r = {
			kind: PathKind.unc,
			prefix: `//?/UNC/${p.slice(0, i)}`,
			path: p.slice(i + 1),
		};
	} else if (winSp.test(p)) {
		const m = winSp.exec(p);
		if (!m) throw new Error(`invalid win special path: ${inp}`);
		p = p.replace(winSp, '$1');
		r = {
			kind: PathKind.win,
			prefix: p.slice(0, m[0].length),
			path: p.slice(m[0].length),
		};
	} else if (winLetter.test(p)) {
		r = {
			kind: PathKind.win,
			prefix: p.slice(0, 3),
			path: p.slice(3),
		};
	} else if (doubleSlash.test(p)) {
		p = p.replace(startingSlashes, '');
		const i = anySlash.exec(p)?.index ?? -1;
		if (i <= 0) throw new Error(`invalid cifs url: ${inp}`);

		r = {
			kind: PathKind.cifs,
			prefix: `//${p.slice(0, i)}`,
			path: p.slice(i + 1),
		};
	} else if (p.startsWith('/')) {
		r = {
			kind: PathKind.unix,
			prefix: '',
			path: p,
		};
	} else {
		const st = p.startsWith('..') ? '..' : '.';
		r = {
			kind: PathKind.relative,
			prefix: st,
			path: p,
		};
	}

	const path = r.path.replace(/\\/g, '/');
	const st = [];
	for (const item of path.split('/')) {
		if (!item || item === '.') continue;
		if (item === '..') {
			st.pop();
		} else {
			st.push(item);
		}
	}
	r.path = st.join('/');

	return r;
}

/**
 * replace // to /
 * replace \ to /
 * remove ending /
 * @deprecated
 */
export function normalizePath(p: string) {
	const r = analyzePath(p);

	if (r.prefix === undefined) {
		return r.path;
	}
	return `${r.prefix}/${r.path}`;
}

/** @deprecated */
export function relativePath(from: string, to: string) {
	const r1 = analyzePath(from);
	const r2 = analyzePath(to);
	if (r1.kind !== r2.kind) throw new Error(`cannot relative path between different kind\n * "${PathKind[r1.kind]}::${from}"\n * "${PathKind[r2.kind]}::${to}"`);

	if (r1.prefix !== r2.prefix) return to;

	const p1arr = r1.path.split('/');
	const p2arr = r2.path.split('/');

	// find same prefix
	let i = 0;
	while (i < p1arr.length && i < p2arr.length && p1arr[i] === p2arr[i]) i++;

	// remove same prefix
	p1arr.splice(0, i);
	p2arr.splice(0, i);

	// add ..
	const p1 = p1arr.length > 0 ? `${p1arr.map(() => '..').join('/')}/` : '';
	const p2 = p2arr.join('/');

	return p1 + p2;
}
