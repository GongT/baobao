// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface ISwapSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#What= */
	What?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#Priority= */
	Priority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#Options= */
	Options?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.swap.html#TimeoutSec= */
	TimeoutSec?: string | number;
}

export const swapFields: readonly string[] = ['What', 'Priority', 'Options', 'TimeoutSec'];
