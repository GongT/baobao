
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IDnssdServiceSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Name= */
	Name?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Type= */
	Type?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Port= */
	Port?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Priority= */
	Priority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Weight= */
	Weight?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#TxtText= */
	TxtText?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#TxtData= */
	TxtData?: MaybeArray<string>;
}

export const dnssdServiceFields: readonly string[] = ["Name","Type","Port","Priority","Weight","TxtText","TxtData"];


