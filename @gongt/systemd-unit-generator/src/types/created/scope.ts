// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IScopeSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.scope.html#OOMPolicy= */
	OOMPolicy?: 'continue' | 'stop' | 'kill' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.scope.html#RuntimeMaxSec= */
	RuntimeMaxSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.scope.html#RuntimeRandomizedExtraSec= */
	RuntimeRandomizedExtraSec?: MaybeArray<string>;
}

export const scopeFields: readonly string[] = ['OOMPolicy', 'RuntimeMaxSec', 'RuntimeRandomizedExtraSec'];
