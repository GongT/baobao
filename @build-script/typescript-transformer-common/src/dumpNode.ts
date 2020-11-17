import { inspect, InspectOptions, InspectOptionsStylized } from 'util';
import { Node, SyntaxKind } from 'typescript';

const found: any[] = [];

function showKind(kind: SyntaxKind) {
	return {
		[inspect.custom](_: number, options: InspectOptionsStylized) {
			return '' + inspect(kind, options) + ' \x1B[38;5;4m[SyntaxKind.' + SyntaxKind[kind] + ']\x1B[0m';
		},
	};
}

function deepRemoveParent<T>(node: T): [T, boolean] {
	if (found.includes(node)) {
		const id = found.indexOf(node) + 1;
		return [
			{
				[inspect.custom](_: number, options: InspectOptionsStylized) {
					return `\x1B[38;5;7mCircular\x1B[0m <OBJ:${inspect(id, options)}>`;
				},
			} as any,
			true,
		];
	}
	const id = found.push(node);

	const clone: any = { ...node };
	let change = false;
	for (const k in clone) {
		if (Array.isArray(clone[k])) {
			clone[k] = clone[k].map((e: any) => deepRemoveParent(e)[0]);
			continue;
		}

		if (k === 'parent') {
			change = true;
			if (clone[k] && clone[k].kind) {
				clone['parent'] = showKind(clone[k].kind);
			} else {
				delete clone['parent'];
			}
		} else if (k === 'kind') {
			clone[k] = showKind(clone[k]);
			change = true;
		} else if (typeof clone[k] === 'object' && clone[k]) {
			const [repl, mchange] = deepRemoveParent(clone[k]);
			if (mchange) {
				clone[k] = repl;
				change = true;
			}
		}
	}

	let ret;
	if (change) {
		ret = [clone, true];
	} else {
		ret = [node, false];
	}
	ret[0][inspect.custom] = function (_: number, options: InspectOptionsStylized) {
		const { [inspect.custom]: x, ...node } = this;
		return `<OBJ:${inspect(id, options)}> ` + inspect(node, { ...options });
	};

	return ret as any;
}
export function dumpFlagStrings(flags: number, def: any, sp = '\n\t') {
	const hit = new Set<string>();
	for (const item of Object.values(def) as any) {
		if (item === 0) {
			if (flags === 0) {
				hit.add(`${def[item]}(${item})`);
			}
		} else if ((item & flags) === item) {
			hit.add(`${def[item]}(${item})`);
		}
	}
	return inspect(flags, { colors: true }) + ' =\x1B[38;5;6m' + [...hit.values()].join(sp) + '\x1B[0m';
}
export function dumpFlags(flags: number, def: any) {
	console.error(dumpFlagStrings(flags, def));
}

export function prettyKind(node: Node) {
	return '{ ' + inspect(showKind(node.kind)) + ' }';
}
export function dumpNode(node: Node | Node[], options: InspectOptions = {}) {
	found.length = 0;

	const v = Array.isArray(node) ? node.map((e: any) => deepRemoveParent(e)[0]) : deepRemoveParent(node)[0];

	console.log(
		inspect(v, {
			depth: 10,
			colors: true,
			compact: false,
			customInspect: true,
			...options,
		})
	);
	found.length = 0;
}
