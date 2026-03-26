import { useMemo } from 'react';
import { NeverChanging } from '../_internal/never-change.js';

/**
 * 创建一个symbol
 */
export function useSymbol(description?: string) {
	return useMemo(() => Symbol(description), NeverChanging);
}
