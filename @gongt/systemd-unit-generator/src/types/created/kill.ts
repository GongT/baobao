
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface IKillSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#KillMode= */
	KillMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#KillSignal= */
	KillSignal?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#RestartKillSignal= */
	RestartKillSignal?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#SendSIGHUP= */
	SendSIGHUP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#SendSIGKILL= */
	SendSIGKILL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#FinalKillSignal= */
	FinalKillSignal?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.kill.html#WatchdogSignal= */
	WatchdogSignal?: MaybeArray<string>;
}

export const killFields: readonly string[] = ["KillMode","KillSignal","RestartKillSignal","SendSIGHUP","SendSIGKILL","FinalKillSignal","WatchdogSignal"];


