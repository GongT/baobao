import { isArraySame } from '../array/arraySame';

export function isObjectSame(a: any, b: any) {
	const aks = Object.keys(a);
	if (!isArraySame(aks, Object.keys(b))) {
		return false;
	}

	for (const k of aks) {
		if (a[k] !== b[k]) {
			return false;
		}
	}
	return true;
}

export function isObjectSameRecursive(a: any, b: any) {
	const aks = Object.keys(a);
	if (!isArraySame(aks, Object.keys(b))) {
		return false;
	}

	for (const k of aks) {
		if (a[k] !== b[k]) {
			const av = a[k],
				bv = b[k];
			if (av && bv && typeof av === 'object' && typeof bv === 'object') {
				if (Array.isArray(av)) {
					if (Array.isArray(bv)) {
						if (isArraySame(av, bv)) continue;
					}
				} else if (!Array.isArray(bv)) {
					if (isObjectSameRecursive(a[k], b[k])) continue;
				}
			}

			return false;
		}
	}
	return true;
}
