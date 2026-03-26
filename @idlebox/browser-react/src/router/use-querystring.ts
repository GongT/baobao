import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router';

export function useQueryString() {
	const navi = useNavigate();
	const location = useLocation();
	const params = new URLSearchParams(location.search);

	const update = useCallback(
		function updateQueryString(merge: Record<string, string | readonly string[] | null>, replace = false) {
			for (const [key, value] of Object.entries(merge)) {
				if (value === null) {
					params.delete(key);
				} else if (typeof value === 'string') {
					params.set(key, value);
				} else {
					params.delete(key);
					value.forEach((v) => {
						params.append(key, v);
					});
				}
			}

			navi(`${location.pathname}?${params.toString()}${location.hash}`, { replace: replace });
		},
		[location.pathname, params, location.hash, navi],
	);

	return {
		params,
		update,
	};
}
