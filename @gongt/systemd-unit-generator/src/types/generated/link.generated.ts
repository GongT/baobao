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
 * A link file is said to match an interface if all matches specified by the [Match] section are satisfied. When a link file does not contain valid settings in [Match]
 *
 * section, then the file will match all interfaces and systemd-udevd warns about that. Hint: to avoid the warning and to make it clear that all interfaces shall be
 *
 * matched, add the following:
 *
 * OriginalName=*
 *
 * The first (in alphanumeric order) of the link files that matches a given interface is applied, all later files are ignored, even if they match as well. The following
 *
 * keys are accepted:
 *
 */
export interface ILinkMatchOptions {
	/**
	 * A whitespace-separated list of hardware addresses. The acceptable formats are:
	 *
	 * colon-delimited hexadecimal
	 *
	 * Each field must be one byte. E.g.  "12:34:56:78:90:ab" or "AA:BB:CC:DD:EE:FF".
	 *
	 * Added in version 250.
	 *
	 * hyphen-delimited hexadecimal
	 *
	 * Each field must be one byte. E.g.  "12-34-56-78-90-ab" or "AA-BB-CC-DD-EE-FF".
	 *
	 * Added in version 250.
	 *
	 * dot-delimited hexadecimal
	 *
	 * Each field must be two bytes. E.g.  "1234.5678.90ab" or "AABB.CCDD.EEFF".
	 *
	 * Added in version 250.
	 *
	 * IPv4 address format
	 *
	 * E.g.  "127.0.0.1" or "192.168.0.1".
	 *
	 * Added in version 250.
	 *
	 * IPv6 address format
	 *
	 * E.g.  "2001:0db8:85a3::8a2e:0370:7334" or "::1".
	 *
	 * Added in version 250.
	 *
	 * The total length of each MAC address must be 4 (for IPv4 tunnel), 6 (for Ethernet), 16 (for IPv6 tunnel), or 20 (for InfiniBand). This option may appear more than
	 *
	 * once, in which case the lists are merged. If the empty string is assigned to this option, the list of hardware addresses defined prior to this is reset. Defaults to
	 *
	 * unset.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
	/**
	 * A whitespace-separated list of hardware's permanent addresses. While MACAddress= matches the device's current MAC address, this matches the device's permanent MAC
	 *
	 * address, which may be different from the current one. Use full colon-, hyphen- or dot-delimited hexadecimal, or IPv4 or IPv6 address format. This option may appear
	 *
	 * more than once, in which case the lists are merged. If the empty string is assigned to this option, the list of hardware addresses defined prior to this is reset.
	 *
	 * Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#PermanentMACAddress=
	 */
	PermanentMACAddress: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the persistent path, as exposed by the udev property ID_PATH.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Path=
	 */
	Path: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the driver currently bound to the device, as exposed by the udev property ID_NET_DRIVER of its parent
	 *
	 * device, or if that is not set, the driver as exposed by ethtool -i of the device itself. If the list is prefixed with a "!", the test is inverted.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Driver=
	 */
	Driver: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the device type, as exposed by networkctl list. If the list is prefixed with a "!", the test is inverted.
	 *
	 * Some valid values are "ether", "loopback", "wlan", "wwan". Valid types are named either from the udev "DEVTYPE" attribute, or "ARPHRD_" macros in linux/if_arp.h, so
	 *
	 * this is not comprehensive.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Type=
	 */
	Type: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the device kind, as exposed by networkctl status INTERFACE or ip -d link show INTERFACE. If the list is
	 *
	 * prefixed with a "!", the test is inverted. Some valid values are "bond", "bridge", "gre", "tun", "veth". Valid kinds are given by netlink's "IFLA_INFO_KIND"
	 *
	 * attribute, so this is not comprehensive.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Kind=
	 */
	Kind: MaybeArray<string>;
	/**
	 * A whitespace-separated list of udev property names with their values after equals sign ("="). If multiple properties are specified, the test results are ANDed. If
	 *
	 * the list is prefixed with a "!", the test is inverted. If a value contains white spaces, then please quote whole key and value pair. If a value contains quotation,
	 *
	 * then please escape the quotation with "\".
	 *
	 * Example: if a .link file has the following:
	 *
	 * Property=ID_MODEL_ID=9999 "ID_VENDOR_FROM_DATABASE=vendor name" "KEY=with \"quotation\""
	 *
	 * then, the .link file matches only when an interface has all the above three properties.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Property=
	 */
	Property: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the device name, as exposed by the udev property "INTERFACE". This cannot be used to match on names that
	 *
	 * have already been changed from userspace. Caution is advised when matching on kernel-assigned names, as they are known to be unstable between reboots.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#OriginalName=
	 */
	OriginalName: MaybeArray<string>;
	/**
	 * Matches against the hostname or machine ID of the host. See ConditionHost= in systemd.unit(5) for details. When prefixed with an exclamation mark ("!"), the result
	 *
	 * is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Host=
	 */
	Host: MaybeArray<string>;
	/**
	 * Checks whether the system is executed in a virtualized environment and optionally test whether it is a specific implementation. See ConditionVirtualization= in
	 *
	 * systemd.unit(5) for details. When prefixed with an exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is
	 *
	 * cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Virtualization=
	 */
	Virtualization: MaybeArray<string>;
	/**
	 * Checks whether a specific kernel command line option is set. See ConditionKernelCommandLine= in systemd.unit(5) for details. When prefixed with an exclamation mark
	 *
	 * ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#KernelCommandLine=
	 */
	KernelCommandLine: MaybeArray<string>;
	/**
	 * Checks whether the kernel version (as reported by uname -r) matches a certain expression. See ConditionKernelVersion= in systemd.unit(5) for details. When prefixed
	 *
	 * with an exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#KernelVersion=
	 */
	KernelVersion: MaybeArray<string>;
	/**
	 * Checks whether the specified credential was passed to the systemd-udevd.service service. See System and Service Credentials[1] for details. When prefixed with an
	 *
	 * exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Credential=
	 */
	Credential: MaybeArray<string>;
	/**
	 * Checks whether the system is running on a specific architecture. See ConditionArchitecture= in systemd.unit(5) for details. When prefixed with an exclamation mark
	 *
	 * ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Architecture=
	 */
	Architecture: MaybeArray<string>;
	/**
	 * Checks whether the system is running on a machine with the specified firmware. See ConditionFirmware= in systemd.unit(5) for details. When prefixed with an
	 *
	 * exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Firmware=
	 */
	Firmware: MaybeArray<string>;
}
/**
 * The [Link] section accepts the following keys:
 *
 */
export interface ILinkOptions {
	/**
	 * A description of the device.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Description=
	 */
	Description: MaybeArray<string>;
	/**
	 * The ifalias interface property is set to this value.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Alias=
	 */
	Alias: MaybeArray<string>;
	/**
	 * The policy by which the MAC address should be set. The available policies are:
	 *
	 * persistent
	 *
	 * If the hardware has a persistent MAC address, as most hardware should, and if it is used by the kernel, nothing is done. Otherwise, a new MAC address is
	 *
	 * generated which is guaranteed to be the same on every boot for the given machine and the given device, but which is otherwise random. This feature depends on
	 *
	 * ID_NET_NAME_* properties to exist for the link. On hardware where these properties are not set, the generation of a persistent MAC address will fail.
	 *
	 * Added in version 211.
	 *
	 * random
	 *
	 * If the kernel is using a random MAC address, nothing is done. Otherwise, a new address is randomly generated each time the device appears, typically at boot.
	 *
	 * Either way, the random address will have the "unicast" and "locally administered" bits set.
	 *
	 * Added in version 211.
	 *
	 * none
	 *
	 * Keeps the MAC address assigned by the kernel. Or use the MAC address specified in MACAddress=.
	 *
	 * Added in version 227.
	 *
	 * An empty string assignment is equivalent to setting "none".
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddressPolicy=
	 */
	MACAddressPolicy: MaybeArray<string>;
	/**
	 * The interface MAC address to use. For this setting to take effect, MACAddressPolicy= must either be unset, empty, or "none".
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
	/**
	 * An ordered, space-separated list of policies by which the interface name should be set.  NamePolicy= may be disabled by specifying net.ifnames=0 on the kernel
	 *
	 * command line. Each of the policies may fail, and the first successful one is used. The name is not set directly, but is exported to udev as the property
	 *
	 * ID_NET_NAME, which is, by default, used by a udev(7), rule to set NAME. The available policies are:
	 *
	 * kernel
	 *
	 * If the kernel claims that the name it has set for a device is predictable, then no renaming is performed.
	 *
	 * Added in version 216.
	 *
	 * database
	 *
	 * The name is set based on entries in the udev's Hardware Database with the key ID_NET_NAME_FROM_DATABASE.
	 *
	 * Added in version 211.
	 *
	 * onboard
	 *
	 * The name is set based on information given by the firmware for on-board devices, as exported by the udev property ID_NET_NAME_ONBOARD. See systemd.net-naming-
	 *
	 * scheme(7).
	 *
	 * Added in version 211.
	 *
	 * slot
	 *
	 * The name is set based on information given by the firmware for hot-plug devices, as exported by the udev property ID_NET_NAME_SLOT. See systemd.net-naming-
	 *
	 * scheme(7).
	 *
	 * Added in version 211.
	 *
	 * path
	 *
	 * The name is set based on the device's physical location, as exported by the udev property ID_NET_NAME_PATH. See systemd.net-naming-scheme(7).
	 *
	 * Added in version 211.
	 *
	 * mac
	 *
	 * The name is set based on the device's persistent MAC address, as exported by the udev property ID_NET_NAME_MAC. See systemd.net-naming-scheme(7).
	 *
	 * Added in version 211.
	 *
	 * keep
	 *
	 * If the device already had a name given by userspace (as part of creation of the device or a rename), keep it.
	 *
	 * Added in version 241.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#NamePolicy=
	 */
	NamePolicy: MaybeArray<string>;
	/**
	 * The interface name to use. This option has lower precedence than NamePolicy=, so for this setting to take effect, NamePolicy= must either be unset, empty, disabled,
	 *
	 * or all policies configured there must fail. Also see the example below with "Name=dmz0".
	 *
	 * Note that specifying a name that the kernel might use for another interface (for example "eth0") is dangerous because the name assignment done by udev will race
	 *
	 * with the assignment done by the kernel, and only one interface may use the name. Depending on the order of operations, either udev or the kernel will win, making
	 *
	 * the naming unpredictable. It is best to use some different prefix, for example "internal0"/"external0" or "lan0"/"lan1"/"lan3".
	 *
	 * Interface names must have a minimum length of 1 character and a maximum length of 15 characters, and may contain any 7bit ASCII character, with the exception of
	 *
	 * control characters, ":", "/" and "%". While "."  is an allowed character, it's recommended to avoid it when naming interfaces as various tools (such as
	 *
	 * resolvconf(1)) use it as separator character. Also, fully numeric interface names are not allowed (in order to avoid ambiguity with interface specification by
	 *
	 * numeric indexes), as are the special strings ".", "..", "all" and "default".
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Name=
	 */
	Name: MaybeArray<string>;
	/**
	 * A space-separated list of policies by which the interface's alternative names should be set. Each of the policies may fail, and all successful policies are used.
	 *
	 * The available policies are "database", "onboard", "slot", "path", and "mac". If the kernel does not support the alternative names, then this setting will be
	 *
	 * ignored.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AlternativeNamesPolicy=
	 */
	AlternativeNamesPolicy: MaybeArray<string>;
	/**
	 * The alternative interface name to use. This option can be specified multiple times. If the empty string is assigned to this option, the list is reset, and all prior
	 *
	 * assignments have no effect. If the kernel does not support the alternative names, then this setting will be ignored.
	 *
	 * Alternative interface names may be used to identify interfaces in various tools. In contrast to the primary name (as configured with Name= above) there may be
	 *
	 * multiple alternative names referring to the same interface. Alternative names may have a maximum length of 127 characters, in contrast to the 15 allowed for the
	 *
	 * primary interface name, but otherwise are subject to the same naming constraints.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AlternativeName=
	 */
	AlternativeName: MaybeArray<string>;
	/**
	 * Specifies the device's number of transmit queues. An integer in the range 1...4096. When unset, the kernel's default will be used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitQueues=
	 */
	TransmitQueues: MaybeArray<string>;
	/**
	 * Specifies the device's number of receive queues. An integer in the range 1...4096. When unset, the kernel's default will be used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveQueues=
	 */
	ReceiveQueues: MaybeArray<string>;
	/**
	 * Specifies the transmit queue length of the device in number of packets. An unsigned integer in the range 0...4294967294. When unset, the kernel's default will be
	 *
	 * used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitQueueLength=
	 */
	TransmitQueueLength: MaybeArray<string>;
	/**
	 * The maximum transmission unit in bytes to set for the device. The usual suffixes K, M, G are supported and are understood to the base of 1024.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MTUBytes=
	 */
	MTUBytes: MaybeArray<string>;
	/**
	 * The speed to set for the device, the value is rounded down to the nearest Mbps. The usual suffixes K, M, G are supported and are understood to the base of 1000.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#BitsPerSecond=
	 */
	BitsPerSecond: MaybeArray<string>;
	/**
	 * The duplex mode to set for the device. The accepted values are half and full.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Duplex=
	 */
	Duplex: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to yes, automatic negotiation of transmission parameters is enabled. Autonegotiation is a procedure by which two connected ethernet devices
	 *
	 * choose common transmission parameters, such as speed, duplex mode, and flow control. When unset, the kernel's default will be used.
	 *
	 * Note that if autonegotiation is enabled, speed and duplex settings are read-only. If autonegotiation is disabled, speed and duplex settings are writable if the
	 *
	 * driver supports multiple link modes.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AutoNegotiation=
	 */
	AutoNegotiation: MaybeArray<string>;
	/**
	 * The Wake-on-LAN policy to set for the device. Takes the special value "off" which disables Wake-on-LAN, or space separated list of the following words:
	 *
	 * phy
	 *
	 * Wake on PHY activity.
	 *
	 * Added in version 211.
	 *
	 * unicast
	 *
	 * Wake on unicast messages.
	 *
	 * Added in version 235.
	 *
	 * multicast
	 *
	 * Wake on multicast messages.
	 *
	 * Added in version 235.
	 *
	 * broadcast
	 *
	 * Wake on broadcast messages.
	 *
	 * Added in version 235.
	 *
	 * arp
	 *
	 * Wake on ARP.
	 *
	 * Added in version 235.
	 *
	 * magic
	 *
	 * Wake on receipt of a magic packet.
	 *
	 * Added in version 211.
	 *
	 * secureon
	 *
	 * Enable SecureOn password for MagicPacket. Implied when WakeOnLanPassword= is specified. If specified without WakeOnLanPassword= option, then the password is
	 *
	 * read from the credential "LINK.link.wol.password" (e.g., "60-foo.link.wol.password"), and if the credential not found, then read from "wol.password". See
	 *
	 * ImportCredential=/LoadCredential=/SetCredential= in systemd.exec(5) for details. The password in the credential, must be 6 bytes in hex format with each byte
	 *
	 * separated by a colon (":") like an Ethernet MAC address, e.g., "aa:bb:cc:dd:ee:ff".
	 *
	 * Added in version 235.
	 *
	 * Defaults to unset, and the device's default will be used. This setting can be specified multiple times. If an empty string is assigned, then the all previous
	 *
	 * assignments are cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#WakeOnLan=
	 */
	WakeOnLan: MaybeArray<string>;
	/**
	 * Specifies the SecureOn password for MagicPacket. Takes an absolute path to a regular file or an AF_UNIX stream socket, or the plain password. When a path to a
	 *
	 * regular file is specified, the password is read from it. When an AF_UNIX stream socket is specified, a connection is made to it and the password is read from it.
	 *
	 * The password must be 6 bytes in hex format with each byte separated by a colon (":") like an Ethernet MAC address, e.g., "aa:bb:cc:dd:ee:ff". This implies
	 *
	 * WakeOnLan=secureon. Defaults to unset, and the current value will not be changed.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#WakeOnLanPassword=
	 */
	WakeOnLanPassword: MaybeArray<string>;
	/**
	 * The port option is used to select the device port. The supported values are:
	 *
	 * tp
	 *
	 * An Ethernet interface using Twisted-Pair cable as the medium.
	 *
	 * Added in version 234.
	 *
	 * aui
	 *
	 * Attachment Unit Interface (AUI). Normally used with hubs.
	 *
	 * Added in version 234.
	 *
	 * bnc
	 *
	 * An Ethernet interface using BNC connectors and co-axial cable.
	 *
	 * Added in version 234.
	 *
	 * mii
	 *
	 * An Ethernet interface using a Media Independent Interface (MII).
	 *
	 * Added in version 234.
	 *
	 * fibre
	 *
	 * An Ethernet interface using Optical Fibre as the medium.
	 *
	 * Added in version 234.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Port=
	 */
	Port: MaybeArray<string>;
	/**
	 * This sets what speeds and duplex modes of operation are advertised for auto-negotiation. This implies "AutoNegotiation=yes". The supported values are:
	 *
	 * Table 1. Supported advertise values
	 *
	 * ┌────────────────────────────┬──────────────┬─────────────┐
	 * │ Advertise                  │ Speed (Mbps) │ Duplex Mode │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10baset-full               │ 10           │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10baset1l-full             │ 10           │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10baset-half               │ 10           │ half        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100basefx-full             │ 100          │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100baset-full              │ 100          │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100baset1-full             │ 100          │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100basefx-half             │ 100          │ half        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100baset-half              │ 100          │ half        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 1000basekx-full            │ 1000         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 1000baset-full             │ 1000         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 1000baset1-full            │ 1000         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 1000basex-full             │ 1000         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 1000baset-half             │ 1000         │ half        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 2500baset-full             │ 2500         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 2500basex-full             │ 2500         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 5000baset-full             │ 5000         │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000baser-fec             │ 10000        │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000basecr-full           │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000baseer-full           │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000basekr-full           │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000basekx4-full          │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000baselr-full           │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000baselrm-full          │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000basesr-full           │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 10000baset-full            │ 10000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 20000basekr2-full          │ 20000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 20000basemld2-full         │ 20000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 25000basecr-full           │ 25000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 25000basekr-full           │ 25000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 25000basesr-full           │ 25000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 40000basecr4-full          │ 40000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 40000basekr4-full          │ 40000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 40000baselr4-full          │ 40000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 40000basesr4-full          │ 40000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basecr-full           │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basecr2-full          │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basedr-full           │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basekr-full           │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basekr2-full          │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000baselr-er-fr-full     │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basesr-full           │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 50000basesr2-full          │ 50000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 56000basecr4-full          │ 56000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 56000basekr4-full          │ 56000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 56000baselr4-full          │ 56000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 56000basesr4-full          │ 56000        │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basecr-full          │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basecr2-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basecr4-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basedr-full          │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basedr2-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basekr-full          │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basekr2-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basekr4-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000baselr-er-fr-full    │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000baselr2-er2-fr2-full │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000baselr4-er4-full     │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basesr-full          │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basesr2-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 100000basesr4-full         │ 100000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basecr2-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basecr4-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basedr2-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basedr4-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basekr2-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basekr4-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000baselr2-er2-fr2-full │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000baselr4-er4-fr4-full │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basesr2-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 200000basesr4-full         │ 200000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basecr4-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basecr8-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basedr4-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basedr8-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basekr4-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basekr8-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000baselr4-er4-fr4-full │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000baselr8-er8-fr8-full │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basesr4-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 400000basesr8-full         │ 400000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 800000basecr8-full         │ 800000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 800000basedr8-2-full       │ 800000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 800000basedr8-full         │ 800000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 800000basekr8-full         │ 800000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 800000basesr8-full         │ 800000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ 800000basevr8-full         │ 800000       │ full        │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ asym-pause                 │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ aui                        │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ autonegotiation            │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ backplane                  │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ bnc                        │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ fec-baser                  │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ fec-llrs                   │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ fec-none                   │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ fec-rs                     │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ fibre                      │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ mii                        │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ pause                      │              │             │
	 * ├────────────────────────────┼──────────────┼─────────────┤
	 * │ tp                         │              │             │
	 * └────────────────────────────┴──────────────┴─────────────┘
	 * By default this is unset, i.e. all possible modes will be advertised. This option may be specified more than once, in which case all specified speeds and modes are
	 *
	 * advertised. If the empty string is assigned to this option, the list is reset, and all prior assignments have no effect.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Advertise=
	 */
	Advertise: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, hardware offload for checksumming of ingress network packets is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveChecksumOffload=
	 */
	ReceiveChecksumOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, hardware offload for checksumming of egress network packets is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitChecksumOffload=
	 */
	TransmitChecksumOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, TCP Segmentation Offload (TSO) is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TCPSegmentationOffload=
	 */
	TCPSegmentationOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, TCP6 Segmentation Offload (tx-tcp6-segmentation) is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TCP6SegmentationOffload=
	 */
	TCP6SegmentationOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, Generic Segmentation Offload (GSO) is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericSegmentationOffload=
	 */
	GenericSegmentationOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, Generic Receive Offload (GRO) is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericReceiveOffload=
	 */
	GenericReceiveOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, hardware accelerated Generic Receive Offload (GRO) is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericReceiveOffloadHardware=
	 */
	GenericReceiveOffloadHardware: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, Large Receive Offload (LRO) is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#LargeReceiveOffload=
	 */
	LargeReceiveOffload: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, receive VLAN CTAG hardware acceleration is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveVLANCTAGHardwareAcceleration=
	 */
	ReceiveVLANCTAGHardwareAcceleration: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, transmit VLAN CTAG hardware acceleration is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitVLANCTAGHardwareAcceleration=
	 */
	TransmitVLANCTAGHardwareAcceleration: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, receive filtering on VLAN CTAGs is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveVLANCTAGFilter=
	 */
	ReceiveVLANCTAGFilter: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, transmit VLAN STAG hardware acceleration is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitVLANSTAGHardwareAcceleration=
	 */
	TransmitVLANSTAGHardwareAcceleration: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, receive N-tuple filters and actions are enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#NTupleFilter=
	 */
	NTupleFilter: MaybeArray<string>;
	/**
	 * Specifies the number of receive, transmit, other, or combined channels, respectively. Takes an unsigned integer in the range 1...4294967295 or "max". If set to
	 *
	 * "max", the advertised maximum value of the hardware will be used. When unset, the number will not be changed. Defaults to unset.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels=
	 */
	RxChannels: MaybeArray<string>;
	/**
	 * Specifies the number of receive, transmit, other, or combined channels, respectively. Takes an unsigned integer in the range 1...4294967295 or "max". If set to
	 *
	 * "max", the advertised maximum value of the hardware will be used. When unset, the number will not be changed. Defaults to unset.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels=
	 */
	TxChannels: MaybeArray<string>;
	/**
	 * Specifies the number of receive, transmit, other, or combined channels, respectively. Takes an unsigned integer in the range 1...4294967295 or "max". If set to
	 *
	 * "max", the advertised maximum value of the hardware will be used. When unset, the number will not be changed. Defaults to unset.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels=
	 */
	OtherChannels: MaybeArray<string>;
	/**
	 * Specifies the number of receive, transmit, other, or combined channels, respectively. Takes an unsigned integer in the range 1...4294967295 or "max". If set to
	 *
	 * "max", the advertised maximum value of the hardware will be used. When unset, the number will not be changed. Defaults to unset.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels=
	 */
	CombinedChannels: MaybeArray<string>;
	/**
	 * Specifies the maximum number of pending packets in the NIC receive buffer, mini receive buffer, jumbo receive buffer, or transmit buffer, respectively. Takes an
	 *
	 * unsigned integer in the range 1...4294967295 or "max". If set to "max", the advertised maximum value of the hardware will be used. When unset, the number will not
	 *
	 * be changed. Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize=
	 */
	RxBufferSize: MaybeArray<string>;
	/**
	 * Specifies the maximum number of pending packets in the NIC receive buffer, mini receive buffer, jumbo receive buffer, or transmit buffer, respectively. Takes an
	 *
	 * unsigned integer in the range 1...4294967295 or "max". If set to "max", the advertised maximum value of the hardware will be used. When unset, the number will not
	 *
	 * be changed. Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize=
	 */
	RxMiniBufferSize: MaybeArray<string>;
	/**
	 * Specifies the maximum number of pending packets in the NIC receive buffer, mini receive buffer, jumbo receive buffer, or transmit buffer, respectively. Takes an
	 *
	 * unsigned integer in the range 1...4294967295 or "max". If set to "max", the advertised maximum value of the hardware will be used. When unset, the number will not
	 *
	 * be changed. Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize=
	 */
	RxJumboBufferSize: MaybeArray<string>;
	/**
	 * Specifies the maximum number of pending packets in the NIC receive buffer, mini receive buffer, jumbo receive buffer, or transmit buffer, respectively. Takes an
	 *
	 * unsigned integer in the range 1...4294967295 or "max". If set to "max", the advertised maximum value of the hardware will be used. When unset, the number will not
	 *
	 * be changed. Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize=
	 */
	TxBufferSize: MaybeArray<string>;
	/**
	 * Takes a boolean. When set, enables receive flow control, also known as the ethernet receive PAUSE message (generate and send ethernet PAUSE frames). When unset, the
	 *
	 * kernel's default will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxFlowControl=
	 */
	RxFlowControl: MaybeArray<string>;
	/**
	 * Takes a boolean. When set, enables transmit flow control, also known as the ethernet transmit PAUSE message (respond to received ethernet PAUSE frames). When unset,
	 *
	 * the kernel's default will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TxFlowControl=
	 */
	TxFlowControl: MaybeArray<string>;
	/**
	 * Takes a boolean. When set, auto negotiation enables the interface to exchange state advertisements with the connected peer so that the two devices can agree on the
	 *
	 * ethernet PAUSE configuration. When unset, the kernel's default will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AutoNegotiationFlowControl=
	 */
	AutoNegotiationFlowControl: MaybeArray<string>;
	/**
	 * Specifies the maximum size of a Generic Segment Offload (GSO) packet the device should accept. The usual suffixes K, M, G are supported and are understood to the
	 *
	 * base of 1024. An unsigned integer in the range 1...65536. Defaults to unset.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericSegmentOffloadMaxBytes=
	 */
	GenericSegmentOffloadMaxBytes: MaybeArray<string>;
	/**
	 * Specifies the maximum number of Generic Segment Offload (GSO) segments the device should accept. An unsigned integer in the range 1...65535. Defaults to unset.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericSegmentOffloadMaxSegments=
	 */
	GenericSegmentOffloadMaxSegments: MaybeArray<string>;
	/**
	 * Boolean properties that, when set, enable/disable adaptive Rx/Tx coalescing if the hardware supports it. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#UseAdaptiveRxCoalesce=
	 */
	UseAdaptiveRxCoalesce: MaybeArray<string>;
	/**
	 * Boolean properties that, when set, enable/disable adaptive Rx/Tx coalescing if the hardware supports it. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#UseAdaptiveRxCoalesce=
	 */
	UseAdaptiveTxCoalesce: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	RxCoalesceSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	RxCoalesceIrqSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	RxCoalesceLowSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	RxCoalesceHighSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	TxCoalesceSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	TxCoalesceIrqSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	TxCoalesceLowSec: MaybeArray<string>;
	/**
	 * These properties configure the delay before Rx/Tx interrupts are generated after a packet is sent/received. The "Irq" properties come into effect when the host is
	 *
	 * servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet rate
	 *
	 * threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec=
	 */
	TxCoalesceHighSec: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	RxMaxCoalescedFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	RxMaxCoalescedIrqFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	RxMaxCoalescedLowFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	RxMaxCoalescedHighFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	TxMaxCoalescedFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	TxMaxCoalescedIrqFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	TxMaxCoalescedLowFrames: MaybeArray<string>;
	/**
	 * These properties configure the maximum number of frames that are sent/received before a Rx/Tx interrupt is generated. The "Irq" properties come into effect when the
	 *
	 * host is servicing an IRQ. The "Low" and "High" properties come into effect when the packet rate drops below the low packet rate threshold or exceeds the high packet
	 *
	 * rate threshold respectively if adaptive Rx/Tx coalescing is enabled. When unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames=
	 */
	TxMaxCoalescedHighFrames: MaybeArray<string>;
	/**
	 * These properties configure the low and high packet rate (expressed in packets per second) threshold respectively and are used to determine when the corresponding
	 *
	 * coalescing settings for low and high packet rates come into effect if adaptive Rx/Tx coalescing is enabled. If unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#CoalescePacketRateLow=
	 */
	CoalescePacketRateLow: MaybeArray<string>;
	/**
	 * These properties configure the low and high packet rate (expressed in packets per second) threshold respectively and are used to determine when the corresponding
	 *
	 * coalescing settings for low and high packet rates come into effect if adaptive Rx/Tx coalescing is enabled. If unset, the kernel's defaults will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#CoalescePacketRateLow=
	 */
	CoalescePacketRateHigh: MaybeArray<string>;
	/**
	 * Configures how often to sample the packet rate used for adaptive Rx/Tx coalescing. This property cannot be zero. This lowest time granularity supported by this
	 *
	 * property is seconds. Partial seconds will be rounded up before being passed to the kernel. If unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#CoalescePacketRateSampleIntervalSec=
	 */
	CoalescePacketRateSampleIntervalSec: MaybeArray<string>;
	/**
	 * How long to delay driver in-memory statistics block updates. If the driver does not have an in-memory statistic block, this property is ignored. This property
	 *
	 * cannot be zero. If unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#StatisticsBlockCoalesceSec=
	 */
	StatisticsBlockCoalesceSec: MaybeArray<string>;
	/**
	 * Specifies the medium dependent interface (MDI) mode for the interface. A MDI describes the interface from a physical layer implementation to the physical medium
	 *
	 * used to carry the transmission. Takes one of the following words: "straight" (or equivalently: "mdi"), "crossover" (or equivalently: "mdi-x", "mdix"), and "auto".
	 *
	 * When "straight", the MDI straight through mode will be used. When "crossover", the MDI crossover (MDI-X) mode will be used. When "auto", the MDI status is
	 *
	 * automatically detected. Defaults to unset, and the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * SR-IOVVirtualFunctions=
	 *
	 * Specifies the number of SR-IOV virtual functions. Takes an integer in the range 0...2147483647. Defaults to unset, and automatically determined from the values
	 *
	 * specified in the VirtualFunction= settings in the [SR-IOV] sections.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MDI=
	 */
	MDI: "the" | "following" | "words:" | "straight" | "auto" | string;
}
/**
 * The [SR-IOV] section accepts the following keys. Specify several [SR-IOV] sections to configure several SR-IOVs. SR-IOV provides the ability to partition a single
 *
 * physical PCI resource into virtual PCI functions which can then be injected into a VM. In the case of network VFs, SR-IOV improves north-south network performance (that
 *
 * is, traffic with endpoints outside the host machine) by allowing traffic to bypass the host machine’s network stack.
 *
 */
export interface ILinkSrIovOptions {
	/**
	 * Specifies a Virtual Function (VF), lightweight PCIe function designed solely to move data in and out. Takes an integer in the range 0...2147483646. This option is
	 *
	 * compulsory.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#VirtualFunction=
	 */
	VirtualFunction: MaybeArray<string>;
	/**
	 * Specifies VLAN ID of the virtual function. Takes an integer in the range 1...4095.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#VLANId=
	 */
	VLANId: MaybeArray<string>;
	/**
	 * Specifies quality of service of the virtual function. Takes an integer in the range 1...4294967294.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#QualityOfService=
	 */
	QualityOfService: MaybeArray<string>;
	/**
	 * Specifies VLAN protocol of the virtual function. Takes "802.1Q" or "802.1ad".
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#VLANProtocol=
	 */
	VLANProtocol: MaybeArray<string>;
	/**
	 * Takes a boolean. Controls the MAC spoof checking. When unset, the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACSpoofCheck=
	 */
	MACSpoofCheck: MaybeArray<string>;
	/**
	 * Takes a boolean. Toggle the ability of querying the receive side scaling (RSS) configuration of the virtual function (VF). The VF RSS information like RSS hash key
	 *
	 * may be considered sensitive on some devices where this information is shared between VF and the physical function (PF). When unset, the kernel's default will be
	 *
	 * used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#QueryReceiveSideScaling=
	 */
	QueryReceiveSideScaling: MaybeArray<string>;
	/**
	 * Takes a boolean. Allows one to set trust mode of the virtual function (VF). When set, VF users can set a specific feature which may impact security and/or
	 *
	 * performance. When unset, the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Trust=
	 */
	Trust: MaybeArray<string>;
	/**
	 * Allows one to set the link state of the virtual function (VF). Takes a boolean or a special value "auto". Setting to "auto" means a reflection of the physical
	 *
	 * function (PF) link state, "yes" lets the VF to communicate with other VFs on this host even if the PF link state is down, "no" causes the hardware to drop any
	 *
	 * packets sent by the VF. When unset, the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#LinkState=
	 */
	LinkState: MaybeArray<string>;
	/**
	 * Specifies the MAC address for the virtual function.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
}
export interface ILinkUnit {
	Match: ILinkMatchOptions;
	Link: ILinkOptions;
	SrIov: ILinkSrIovOptions;
}
