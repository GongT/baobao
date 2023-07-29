
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface ITimerSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnActiveSec= */
	OnActiveSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnActiveSec= */
	OnBootSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnActiveSec= */
	OnStartupSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnActiveSec= */
	OnUnitActiveSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnActiveSec= */
	OnUnitInactiveSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnCalendar= */
	OnCalendar?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#AccuracySec= */
	AccuracySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#RandomizedDelaySec= */
	RandomizedDelaySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#FixedRandomDelay= */
	FixedRandomDelay?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnClockChange= */
	OnClockChange?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#OnClockChange= */
	OnTimezoneChange?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#Unit= */
	Unit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#Persistent= */
	Persistent?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#WakeSystem= */
	WakeSystem?: MaybeArray<BooleanType>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.timer.html#RemainAfterElapse= */
	RemainAfterElapse?: MaybeArray<string>;
}

export const timerFields: readonly string[] = ["OnActiveSec","OnBootSec","OnStartupSec","OnUnitActiveSec","OnUnitInactiveSec","OnCalendar","AccuracySec","RandomizedDelaySec","FixedRandomDelay","OnClockChange","OnTimezoneChange","Unit","Persistent","WakeSystem","RemainAfterElapse"];


