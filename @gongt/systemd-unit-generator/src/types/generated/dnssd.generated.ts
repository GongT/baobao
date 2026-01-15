// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore

/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * @build-script/codegen - The Simple Code Generater
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/



// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

/**
 * The network service file contains a [Service] section, which specifies a discoverable network service announced in a local network with Multicast DNS broadcasts.
 *
 */
export interface IDnssdServiceOptions {
	/**
	 * An instance name of the network service as defined in the section 4.1.1 of RFC 6763[1], e.g.  "webserver".
	 *
	 * The option supports simple specifier expansion. The following expansions are understood:
	 *
	 * Table 1. Specifiers available
	 *
	 * ┌───────────┬───────────────────────────────────┬──────────────────────────────────────────────┐
	 * │ Specifier │ Meaning                           │ Details                                      │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%a"      │ Architecture                      │ A short string identifying the architecture  │
	 * │           │                                   │ of the local system. A string such as x86,   │
	 * │           │                                   │ x86-64 or arm64. See the architectures       │
	 * │           │                                   │ defined for ConditionArchitecture= in        │
	 * │           │                                   │ systemd.unit(5) for a full list.             │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%A"      │ Operating system image version    │ The operating system image version           │
	 * │           │                                   │ identifier of the running system, as read    │
	 * │           │                                   │ from the IMAGE_VERSION= field of             │
	 * │           │                                   │ /etc/os-release. If not set, resolves to an  │
	 * │           │                                   │ empty string. See os-release(5) for more     │
	 * │           │                                   │ information.                                 │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%b"      │ Boot ID                           │ The boot ID of the running system, formatted │
	 * │           │                                   │ as string. See random(4) for more            │
	 * │           │                                   │ information.                                 │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%B"      │ Operating system build ID         │ The operating system build identifier of the │
	 * │           │                                   │ running system, as read from the BUILD_ID=   │
	 * │           │                                   │ field of /etc/os-release. If not set,        │
	 * │           │                                   │ resolves to an empty string. See os-         │
	 * │           │                                   │ release(5) for more information.             │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%H"      │ Host name                         │ The hostname of the running system.          │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%m"      │ Machine ID                        │ The machine ID of the running system,        │
	 * │           │                                   │ formatted as string. See machine-id(5) for   │
	 * │           │                                   │ more information.                            │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%M"      │ Operating system image identifier │ The operating system image identifier of the │
	 * │           │                                   │ running system, as read from the IMAGE_ID=   │
	 * │           │                                   │ field of /etc/os-release. If not set,        │
	 * │           │                                   │ resolves to an empty string. See os-         │
	 * │           │                                   │ release(5) for more information.             │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%o"      │ Operating system ID               │ The operating system identifier of the       │
	 * │           │                                   │ running system, as read from the ID= field   │
	 * │           │                                   │ of /etc/os-release. See os-release(5) for    │
	 * │           │                                   │ more information.                            │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%v"      │ Kernel release                    │ Identical to uname -r output.                │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%w"      │ Operating system version ID       │ The operating system version identifier of   │
	 * │           │                                   │ the running system, as read from the         │
	 * │           │                                   │ VERSION_ID= field of /etc/os-release. If not │
	 * │           │                                   │ set, resolves to an empty string. See os-    │
	 * │           │                                   │ release(5) for more information.             │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%W"      │ Operating system variant ID       │ The operating system variant identifier of   │
	 * │           │                                   │ the running system, as read from the         │
	 * │           │                                   │ VARIANT_ID= field of /etc/os-release. If not │
	 * │           │                                   │ set, resolves to an empty string. See os-    │
	 * │           │                                   │ release(5) for more information.             │
	 * ├───────────┼───────────────────────────────────┼──────────────────────────────────────────────┤
	 * │ "%%"      │ Single percent sign               │ Use "%%" in place of "%" to specify a single │
	 * │           │                                   │ percent sign.                                │
	 * └───────────┴───────────────────────────────────┴──────────────────────────────────────────────┘
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Name=
	 */
	Name: MaybeArray<string>;
	/**
	 * A type of the network service as defined in the section 4.1.2 of RFC 6763[1], e.g.  "_http._tcp".
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Type=
	 */
	Type: MaybeArray<string>;
	/**
	 * An IP port number of the network service.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Port=
	 */
	Port: MaybeArray<string>;
	/**
	 * A priority number set in SRV resource records corresponding to the network service.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Priority=
	 */
	Priority: MaybeArray<string>;
	/**
	 * A weight number set in SRV resource records corresponding to the network service.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#Weight=
	 */
	Weight: MaybeArray<string>;
	/**
	 * A whitespace-separated list of arbitrary key/value pairs conveying additional information about the named service in the corresponding TXT resource record, e.g.
	 *
	 * "path=/portal/index.html". Keys and values can contain C-style escape sequences which get translated upon reading configuration files.
	 *
	 * This option together with TxtData= may be specified more than once, in which case multiple TXT resource records will be created for the service. If the empty string
	 *
	 * is assigned to this option, the list is reset and all prior assignments will have no effect.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#TxtText=
	 */
	TxtText: MaybeArray<string>;
	/**
	 * A whitespace-separated list of arbitrary key/value pairs conveying additional information about the named service in the corresponding TXT resource record where
	 *
	 * values are base64-encoded string representing any binary data, e.g.  "data=YW55IGJpbmFyeSBkYXRhCg==". Keys can contain C-style escape sequences which get translated
	 *
	 * upon reading configuration files.
	 *
	 * This option together with TxtText= may be specified more than once, in which case multiple TXT resource records will be created for the service. If the empty string
	 *
	 * is assigned to this option, the list is reset and all prior assignments will have no effect.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.dnssd.html#TxtData=
	 */
	TxtData: MaybeArray<string>;
}
export interface IDnssdUnit {
	Service: IDnssdServiceOptions;
}
