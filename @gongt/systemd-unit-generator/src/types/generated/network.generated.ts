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
 * The network file contains a [Match] section, which determines if a given network file may be applied to a given interface; and a [Network] section specifying how the
 *
 * interface should be configured. The first (in alphanumeric order) of the network files that matches a given interface is applied, all later files are ignored, even if
 *
 * they match as well.
 *
 * Note that any network interfaces that have the ID_NET_MANAGED_BY= udev property set will never be matched by any .network files – unless the property's value is the
 *
 * string "io.systemd.Network" – even if the [Match] section would otherwise match. This may be used to exclude specific network interfaces from systemd-networkd's
 *
 * management, while keeping the [Match] section generic. The ID_NET_MANAGED_BY= property thus declares intended ownership of the device, and permits ensuring that
 *
 * concurrent network management implementations do not compete for management of specific devices.
 *
 * A network file is said to match a network interface if all matches specified by the [Match] section are satisfied. When a network file does not contain valid settings
 *
 * in [Match] section, then the file will match all interfaces and systemd-networkd warns about that. Hint: to avoid the warning and to make it clear that all interfaces
 *
 * shall be matched, add the following:
 *
 * Name=*
 *
 * The following keys are accepted:
 *
 */
export interface INetworkMatchOptions {
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PermanentMACAddress=
	 */
	PermanentMACAddress: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the persistent path, as exposed by the udev property ID_PATH.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Path=
	 */
	Path: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the driver currently bound to the device, as exposed by the udev property ID_NET_DRIVER of its parent
	 *
	 * device, or if that is not set, the driver as exposed by ethtool -i of the device itself. If the list is prefixed with a "!", the test is inverted.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Driver=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Type=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Kind=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Property=
	 */
	Property: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the device name, as exposed by the udev property "INTERFACE", or device's alternative names. If the list
	 *
	 * is prefixed with a "!", the test is inverted.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Name=
	 */
	Name: MaybeArray<string>;
	/**
	 * A whitespace-separated list of wireless network type. Supported values are "ad-hoc", "station", "ap", "ap-vlan", "wds", "monitor", "mesh-point", "p2p-client",
	 *
	 * "p2p-go", "p2p-device", "ocb", and "nan". If the list is prefixed with a "!", the test is inverted.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#WLANInterfaceType=
	 */
	WLANInterfaceType: MaybeArray<string>;
	/**
	 * A whitespace-separated list of shell-style globs matching the SSID of the currently connected wireless LAN. If the list is prefixed with a "!", the test is
	 *
	 * inverted.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SSID=
	 */
	SSID: MaybeArray<string>;
	/**
	 * A whitespace-separated list of hardware address of the currently connected wireless LAN. Use full colon-, hyphen- or dot-delimited hexadecimal. See the example in
	 *
	 * MACAddress=. This option may appear more than once, in which case the lists are merged. If the empty string is assigned to this option, the list is reset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BSSID=
	 */
	BSSID: MaybeArray<string>;
	/**
	 * Matches against the hostname or machine ID of the host. See ConditionHost= in systemd.unit(5) for details. When prefixed with an exclamation mark ("!"), the result
	 *
	 * is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Host=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Virtualization=
	 */
	Virtualization: MaybeArray<string>;
	/**
	 * Checks whether a specific kernel command line option is set. See ConditionKernelCommandLine= in systemd.unit(5) for details. When prefixed with an exclamation mark
	 *
	 * ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KernelCommandLine=
	 */
	KernelCommandLine: MaybeArray<string>;
	/**
	 * Checks whether the kernel version (as reported by uname -r) matches a certain expression. See ConditionKernelVersion= in systemd.unit(5) for details. When prefixed
	 *
	 * with an exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KernelVersion=
	 */
	KernelVersion: MaybeArray<string>;
	/**
	 * Checks whether the specified credential was passed to the systemd-udevd.service service. See System and Service Credentials[1] for details. When prefixed with an
	 *
	 * exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Credential=
	 */
	Credential: MaybeArray<string>;
	/**
	 * Checks whether the system is running on a specific architecture. See ConditionArchitecture= in systemd.unit(5) for details. When prefixed with an exclamation mark
	 *
	 * ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Architecture=
	 */
	Architecture: MaybeArray<string>;
	/**
	 * Checks whether the system is running on a machine with the specified firmware. See ConditionFirmware= in systemd.unit(5) for details. When prefixed with an
	 *
	 * exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Firmware=
	 */
	Firmware: MaybeArray<string>;
}
/**
 * The [Link] section accepts the following keys:
 *
 */
export interface INetworkLinkOptions {
	/**
	 * The hardware address to set for the device.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
	/**
	 * The maximum transmission unit in bytes to set for the device. The usual suffixes K, M, G, are supported and are understood to the base of 1024.
	 *
	 * Note that if IPv6 is enabled on the interface, and the MTU is chosen below 1280 (the minimum MTU for IPv6) it will automatically be increased to this value.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes=
	 */
	MTUBytes: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, the ARP (low-level Address Resolution Protocol) for this interface is enabled. When unset, the kernel's default will be used.
	 *
	 * For example, disabling ARP is useful when creating multiple MACVLAN or VLAN virtual interfaces atop a single lower-level physical interface, which will then only
	 *
	 * serve as a link/"bridge" device aggregating traffic to the same physical link and not participate in the network otherwise. Defaults to unset.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ARP=
	 */
	ARP: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, the multicast flag on the device is enabled. Defaults to unset.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Multicast=
	 */
	Multicast: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, the driver retrieves all multicast packets from the network. This happens when multicast routing is enabled. Defaults to unset.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AllMulticast=
	 */
	AllMulticast: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, promiscuous mode of the interface is enabled. Defaults to unset.
	 *
	 * If this is set to false for the underlying link of a "passthru" mode MACVLAN/MACVTAP, the virtual interface will be created with the "nopromisc" flag set.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Promiscuous=
	 */
	Promiscuous: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", no attempts are made to bring up or configure matching links, equivalent to when there are no matching network files. Defaults to "no".
	 *
	 * This is useful for preventing later matching network files from interfering with certain interfaces that are fully controlled by other applications.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Unmanaged=
	 */
	Unmanaged: MaybeArray<string>;
	/**
	 * Link groups are similar to port ranges found in managed switches. When network interfaces are added to a numbered group, operations on all the interfaces from that
	 *
	 * group can be performed at once. Takes an unsigned integer in the range 0...2147483647. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Group=
	 */
	Group: MaybeArray<string>;
	/**
	 * Takes a boolean or a minimum operational state and an optional maximum operational state. Please see networkctl(1) for possible operational states. When "yes", the
	 *
	 * network is deemed required when determining whether the system is online (including when running systemd-networkd-wait-online). When "no", the network is ignored
	 *
	 * when determining the online state. When a minimum operational state and an optional maximum operational state are set, "yes" is implied, and this controls the
	 *
	 * minimum and maximum operational state required for the network interface to be considered online.
	 *
	 * Defaults to "yes" when ActivationPolicy= is not set, or set to "up", "always-up", or "bound". Defaults to "no" when ActivationPolicy= is set to "manual" or "down".
	 *
	 * This is forced to "no" when ActivationPolicy= is set to "always-down".
	 *
	 * The network will be brought up normally (as configured by ActivationPolicy=), but in the event that there is no address being assigned by DHCP or the cable is not
	 *
	 * plugged in, the link will simply remain offline and be skipped automatically by systemd-networkd-wait-online if "RequiredForOnline=no".
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequiredForOnline=
	 */
	RequiredForOnline: MaybeArray<string>;
	/**
	 * Takes an address family. When specified, an IP address in the given family is deemed required when determining whether the link is online (including when running
	 *
	 * systemd-networkd-wait-online). Takes one of "ipv4", "ipv6", "both", or "any". Defaults to "no". Note that this option has no effect if "RequiredForOnline=no".
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequiredFamilyForOnline=
	 */
	RequiredFamilyForOnline: "ipv4" | "ipv6" | "both" | "any" | string;
	/**
	 * Specifies the policy for systemd-networkd managing the link administrative state. Specifically, this controls how systemd-networkd changes the network device's
	 *
	 * "IFF_UP" flag, which is sometimes controlled by system administrators by running e.g., ip link set dev eth0 up or ip link set dev eth0 down, and can also be changed
	 *
	 * with networkctl up eth0 or networkctl down eth0.
	 *
	 * Takes one of "up", "always-up", "manual", "always-down", "down", or "bound". When "manual", systemd-networkd will not change the link's admin state automatically;
	 *
	 * the system administrator must bring the interface up or down manually, as desired. When "up" (the default) or "always-up", or "down" or "always-down",
	 *
	 * systemd-networkd will set the link up or down, respectively, when the interface is (re)configured. When "always-up" or "always-down", systemd-networkd will set the
	 *
	 * link up or down, respectively, any time systemd-networkd detects a change in the administrative state. When BindCarrier= is also set, this is automatically set to
	 *
	 * "bound" and any other value is ignored.
	 *
	 * When the policy is set to "down" or "manual", the default value of RequiredForOnline= is "no". When the policy is set to "always-down", the value of
	 *
	 * RequiredForOnline= forced to "no".
	 *
	 * The administrative state is not the same as the carrier state, so using "always-up" does not mean the link will never lose carrier. The link carrier depends on both
	 *
	 * the administrative state as well as the network device's physical connection. However, to avoid reconfiguration failures, when using "always-up", IgnoreCarrierLoss=
	 *
	 * is forced to true.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ActivationPolicy=
	 */
	ActivationPolicy: "up" | "always-up" | "manual" | "always-down" | "down" | "bound" | string;
}
/**
 * The [SR-IOV] section accepts the following keys. Specify several [SR-IOV] sections to configure several SR-IOVs. SR-IOV provides the ability to partition a single
 *
 * physical PCI resource into virtual PCI functions which can then be injected into a VM. In the case of network VFs, SR-IOV improves north-south network performance (that
 *
 * is, traffic with endpoints outside the host machine) by allowing traffic to bypass the host machine’s network stack.
 *
 */
export interface INetworkSrIovOptions {
	/**
	 * Specifies a Virtual Function (VF), lightweight PCIe function designed solely to move data in and out. Takes an integer in the range 0...2147483646. This option is
	 *
	 * compulsory.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VirtualFunction=
	 */
	VirtualFunction: MaybeArray<string>;
	/**
	 * Specifies VLAN ID of the virtual function. Takes an integer in the range 1...4095.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANId=
	 */
	VLANId: MaybeArray<string>;
	/**
	 * Specifies quality of service of the virtual function. Takes an integer in the range 1...4294967294.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QualityOfService=
	 */
	QualityOfService: MaybeArray<string>;
	/**
	 * Specifies VLAN protocol of the virtual function. Takes "802.1Q" or "802.1ad".
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANProtocol=
	 */
	VLANProtocol: MaybeArray<string>;
	/**
	 * Takes a boolean. Controls the MAC spoof checking. When unset, the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACSpoofCheck=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QueryReceiveSideScaling=
	 */
	QueryReceiveSideScaling: MaybeArray<string>;
	/**
	 * Takes a boolean. Allows one to set trust mode of the virtual function (VF). When set, VF users can set a specific feature which may impact security and/or
	 *
	 * performance. When unset, the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Trust=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LinkState=
	 */
	LinkState: MaybeArray<string>;
	/**
	 * Specifies the MAC address for the virtual function.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
}
/**
 * The [Network] section accepts the following keys:
 *
 */
export interface INetworkOptions {
	/**
	 * A description of the device. This is only used for presentation purposes.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Description=
	 */
	Description: MaybeArray<string>;
	/**
	 * Enables DHCPv4 and/or DHCPv6 client support. Accepts "yes", "no", "ipv4", or "ipv6". Defaults to "no".
	 *
	 * Note that DHCPv6 will by default be triggered by Router Advertisements, if reception is enabled, regardless of this parameter. By explicitly enabling DHCPv6 support
	 *
	 * here, the DHCPv6 client will be started in the mode specified by the WithoutRA= setting in the [DHCPv6] section, regardless of the presence of routers on the link,
	 *
	 * or what flags the routers pass. See IPv6AcceptRA=.
	 *
	 * Furthermore, note that by default the domain name specified through DHCP is not used for name resolution. See option UseDomains= below.
	 *
	 * See the [DHCPv4] or [DHCPv6] sections below for further configuration options for the DHCP client support.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCP=
	 */
	DHCP: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to "yes", DHCPv4 server will be started. Defaults to "no". Further settings for the DHCP server may be set in the [DHCPServer] section
	 *
	 * described below.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCPServer=
	 */
	DHCPServer: MaybeArray<string>;
	/**
	 * Enables link-local address autoconfiguration. Accepts a boolean, ipv4, and ipv6. An IPv6 link-local address is configured when yes or ipv6. An IPv4 link-local
	 *
	 * address is configured when yes or ipv4 and when DHCPv4 autoconfiguration has been unsuccessful for some time. (IPv4 link-local address autoconfiguration will
	 *
	 * usually happen in parallel with repeated attempts to acquire a DHCPv4 lease).
	 *
	 * Defaults to no when KeepMaster= or Bridge= is set or when the specified MACVLAN=/MACVTAP= has Mode=passthru, or ipv6 otherwise.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LinkLocalAddressing=
	 */
	LinkLocalAddressing: MaybeArray<string>;
	/**
	 * Specifies how IPv6 link-local address is generated. Takes one of "eui64", "none", "stable-privacy" and "random". When unset, "stable-privacy" is used if
	 *
	 * IPv6StableSecretAddress= is specified, and if not, "eui64" is used. Note that if LinkLocalAddressing= is "no" or "ipv4", then IPv6LinkLocalAddressGenerationMode=
	 *
	 * will be ignored. Also, even if LinkLocalAddressing= is "yes" or "ipv6", setting IPv6LinkLocalAddressGenerationMode=none disables to configure an IPv6 link-local
	 *
	 * address.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6LinkLocalAddressGenerationMode=
	 */
	IPv6LinkLocalAddressGenerationMode: "eui64" | "none" | "stable-privacy" | "random" | string;
	/**
	 * Takes an IPv6 address. The specified address will be used as a stable secret for generating IPv6 link-local address. If this setting is specified, and
	 *
	 * IPv6LinkLocalAddressGenerationMode= is unset, then IPv6LinkLocalAddressGenerationMode=stable-privacy is implied. If this setting is not specified, and
	 *
	 * "stable-privacy" is set to IPv6LinkLocalAddressGenerationMode=, then a stable secret address will be generated from the local machine ID and the interface name.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6StableSecretAddress=
	 */
	IPv6StableSecretAddress: MaybeArray<string>;
	/**
	 * Specifies the first IPv4 link-local address to try. Takes an IPv4 address for example 169.254.1.2, from the link-local address range: 169.254.0.0/16 except for
	 *
	 * 169.254.0.0/24 and 169.254.255.0/24. This setting may be useful if the device should always have the same address as long as there is no address conflict. When
	 *
	 * unset, a random address will be automatically selected. Defaults to unset.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4LLStartAddress=
	 */
	IPv4LLStartAddress: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, sets up the route needed for non-IPv4LL hosts to communicate with IPv4LL-only hosts. Defaults to false.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4LLRoute=
	 */
	IPv4LLRoute: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, sets up the IPv4 default route bound to the interface. Defaults to false. This is useful when creating routes on point-to-point
	 *
	 * interfaces. This is equivalent to e.g. the following,
	 *
	 * ip route add default dev veth99
	 *
	 * or,
	 *
	 * [Route]
	 *
	 * Gateway=0.0.0.0
	 *
	 * Currently, there are no way to specify e.g., the table for the route configured by this setting. To configure the default route with such an additional property,
	 *
	 * please use the following instead:
	 *
	 * [Route]
	 *
	 * Gateway=0.0.0.0
	 *
	 * Table=1234
	 *
	 * If you'd like to create an IPv6 default route bound to the interface, please use the following:
	 *
	 * [Route]
	 *
	 * Gateway=::
	 *
	 * Table=1234
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultRouteOnDevice=
	 */
	DefaultRouteOnDevice: MaybeArray<string>;
	/**
	 * Takes a boolean or "resolve". When true, enables Link-Local Multicast Name Resolution[2] on the link. When set to "resolve", only resolution is enabled, but not
	 *
	 * host registration and announcement. Defaults to true. This setting is read by systemd-resolved.service(8).
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LLMNR=
	 */
	LLMNR: MaybeArray<string>;
	/**
	 * Takes a boolean or "resolve". When true, enables Multicast DNS[3] support on the link. When set to "resolve", only resolution is enabled, but not host or service
	 *
	 * registration and announcement. Defaults to false. This setting is read by systemd-resolved.service(8).
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastDNS=
	 */
	MulticastDNS: MaybeArray<string>;
	/**
	 * Takes a boolean or "opportunistic". When true, enables DNS-over-TLS[4] support on the link. When set to "opportunistic", compatibility with non-DNS-over-TLS servers
	 *
	 * is increased, by automatically turning off DNS-over-TLS servers in this case. This option defines a per-interface setting for resolved.conf(5)'s global DNSOverTLS=
	 *
	 * option. Defaults to unset, and the global setting will be used. This setting is read by systemd-resolved.service(8).
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSOverTLS=
	 */
	DNSOverTLS: MaybeArray<string>;
	/**
	 * Takes a boolean or "allow-downgrade". When true, enables DNSSEC[5] DNS validation support on the link. When set to "allow-downgrade", compatibility with non-DNSSEC
	 *
	 * capable networks is increased, by automatically turning off DNSSEC in this case. This option defines a per-interface setting for resolved.conf(5)'s global DNSSEC=
	 *
	 * option. Defaults to unset, and the global setting will be used. This setting is read by systemd-resolved.service(8).
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSSEC=
	 */
	DNSSEC: MaybeArray<string>;
	/**
	 * A space-separated list of DNSSEC negative trust anchor domains. If specified and DNSSEC is enabled, look-ups done via the interface's DNS server will be subject to
	 *
	 * the list of negative trust anchors, and not require authentication for the specified domains, or anything below it. Use this to disable DNSSEC authentication for
	 *
	 * specific private domains, that cannot be proven valid using the Internet DNS hierarchy. Defaults to the empty list. This setting is read by systemd-
	 *
	 * resolved.service(8).
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSSECNegativeTrustAnchors=
	 */
	DNSSECNegativeTrustAnchors: MaybeArray<string>;
	/**
	 * Controls support for Ethernet LLDP packet reception. LLDP is a link-layer protocol commonly implemented on professional routers and bridges which announces which
	 *
	 * physical port a system is connected to, as well as other related data. Accepts a boolean or the special value "routers-only". When true, incoming LLDP packets are
	 *
	 * accepted and a database of all LLDP neighbors maintained. If "routers-only" is set only LLDP data of various types of routers is collected and LLDP data about other
	 *
	 * types of devices ignored (such as stations, telephones and others). If false, LLDP reception is disabled. Defaults to "routers-only". Use networkctl(1) to query the
	 *
	 * collected neighbor data. LLDP is only available on Ethernet links. See EmitLLDP= below for enabling LLDP packet emission from the local system.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LLDP=
	 */
	LLDP: MaybeArray<string>;
	/**
	 * Controls support for Ethernet LLDP packet emission. Accepts a boolean parameter or the special values "nearest-bridge", "non-tpmr-bridge" and "customer-bridge".
	 *
	 * Defaults to false, which turns off LLDP packet emission. If not false, a short LLDP packet with information about the local system is sent out in regular intervals
	 *
	 * on the link. The LLDP packet will contain information about the local hostname, the local machine ID (as stored in machine-id(5)) and the local interface name, as
	 *
	 * well as the pretty hostname of the system (as set in machine-info(5)). LLDP emission is only available on Ethernet links. Note that this setting passes data
	 *
	 * suitable for identification of host to the network and should thus not be enabled on untrusted networks, where such identification data should not be made
	 *
	 * available. Use this option to permit other systems to identify on which interfaces they are connected to this system. The three special values control propagation
	 *
	 * of the LLDP packets. The "nearest-bridge" setting permits propagation only to the nearest connected bridge, "non-tpmr-bridge" permits propagation across Two-Port
	 *
	 * MAC Relays, but not any other bridges, and "customer-bridge" permits propagation until a customer bridge is reached. For details about these concepts, see IEEE
	 *
	 * 802.1AB-2016[6]. Note that configuring this setting to true is equivalent to "nearest-bridge", the recommended and most restricted level of propagation. See LLDP=
	 *
	 * above for an option to enable LLDP reception.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitLLDP=
	 */
	EmitLLDP: MaybeArray<string>;
	/**
	 * A link name or a list of link names. When set, controls the behavior of the current link. When all links in the list are in an operational down state, the current
	 *
	 * link is brought down. When at least one link has carrier, the current interface is brought up.
	 *
	 * This forces ActivationPolicy= to be set to "bound".
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BindCarrier=
	 */
	BindCarrier: MaybeArray<string>;
	/**
	 * A static IPv4 or IPv6 address and its prefix length, separated by a "/" character. Specify this key more than once to configure several addresses. The format of the
	 *
	 * address must be as described in inet_pton(3). This is a short-hand for an [Address] section only containing an Address key (see below). This option may be specified
	 *
	 * more than once.
	 *
	 * If the specified address is "0.0.0.0" (for IPv4) or "::" (for IPv6), a new address range of the requested size is automatically allocated from a system-wide pool of
	 *
	 * unused ranges. Note that the prefix length must be equal or larger than 8 for IPv4, and 64 for IPv6. The allocated range is checked against all current network
	 *
	 * interfaces and all known network configuration files to avoid address range conflicts. The default system-wide pool consists of 192.168.0.0/16, 172.16.0.0/12 and
	 *
	 * 10.0.0.0/8 for IPv4, and fd00::/8 for IPv6. This functionality is useful to manage a large number of dynamically created network interfaces with the same network
	 *
	 * configuration and automatic address range assignment.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address=
	 */
	Address: MaybeArray<string>;
	/**
	 * The gateway address, which must be in the format described in inet_pton(3). This is a short-hand for a [Route] section only containing a Gateway= key. This option
	 *
	 * may be specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Gateway=
	 */
	Gateway: MaybeArray<string>;
	/**
	 * A DNS server address, which must be in the format described in inet_pton(3). This option may be specified more than once. Each address can optionally take a port
	 *
	 * number separated with ":", a network interface name or index separated with "%", and a Server Name Indication (SNI) separated with "#". When IPv6 address is
	 *
	 * specified with a port number, then the address must be in the square brackets. That is, the acceptable full formats are "111.222.333.444:9953%ifname#example.com"
	 *
	 * for IPv4 and "[1111:2222::3333]:9953%ifname#example.com" for IPv6. If an empty string is assigned, then the all previous assignments are cleared. This setting is
	 *
	 * read by systemd-resolved.service(8).
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNS=
	 */
	DNS: MaybeArray<string>;
	/**
	 * A whitespace-separated list of domains which should be resolved using the DNS servers on this link. Each item in the list should be a domain name, optionally
	 *
	 * prefixed with a tilde ("~"). The domains with the prefix are called "routing-only domains". The domains without the prefix are called "search domains" and are first
	 *
	 * used as search suffixes for extending single-label hostnames (hostnames containing no dots) to become fully qualified domain names (FQDNs). If a single-label
	 *
	 * hostname is resolved on this interface, each of the specified search domains are appended to it in turn, converting it into a fully qualified domain name, until one
	 *
	 * of them may be successfully resolved.
	 *
	 * Both "search" and "routing-only" domains are used for routing of DNS queries: look-ups for hostnames ending in those domains (hence also single label names, if any
	 *
	 * "search domains" are listed), are routed to the DNS servers configured for this interface. The domain routing logic is particularly useful on multi-homed hosts with
	 *
	 * DNS servers serving particular private DNS zones on each interface.
	 *
	 * The "routing-only" domain "~."  (the tilde indicating definition of a routing domain, the dot referring to the DNS root domain which is the implied suffix of all
	 *
	 * valid DNS names) has special effect. It causes all DNS traffic which does not match another configured domain routing entry to be routed to DNS servers specified
	 *
	 * for this interface. This setting is useful to prefer a certain set of DNS servers if a link on which they are connected is available.
	 *
	 * This setting is read by systemd-resolved.service(8). "Search domains" correspond to the domain and search entries in resolv.conf(5). Domain name routing has no
	 *
	 * equivalent in the traditional glibc API, which has no concept of domain name servers limited to a specific link.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Domains=
	 */
	Domains: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, this link's configured DNS servers are used for resolving domain names that do not match any link's configured Domains= setting.
	 *
	 * If false, this link's configured DNS servers are never used for such domains, and are exclusively used for resolving names that match at least one of the domains
	 *
	 * configured on this link. If not specified defaults to an automatic mode: queries not matching any link's configured domains will be routed to this link if it has no
	 *
	 * routing-only domains configured.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSDefaultRoute=
	 */
	DNSDefaultRoute: MaybeArray<string>;
	/**
	 * An NTP server address (either an IP address, or a hostname). This option may be specified more than once. This setting is read by systemd-timesyncd.service(8).
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NTP=
	 */
	NTP: MaybeArray<string>;
	/**
	 * Configures IP packet forwarding for the system. If enabled, incoming packets on any network interface will be forwarded to any other interfaces according to the
	 *
	 * routing table. Takes a boolean, or the values "ipv4" or "ipv6", which only enable IP packet forwarding for the specified address family. This controls the
	 *
	 * net.ipv4.ip_forward and net.ipv6.conf.all.forwarding sysctl options of the network interface (see IP Sysctl[7] for details about sysctl options). Defaults to "no".
	 *
	 * Note: this setting controls a global kernel option, and does so one way only: if a network that has this setting enabled is set up the global setting is turned on.
	 *
	 * However, it is never turned off again, even after all networks with this setting enabled are shut down again.
	 *
	 * To allow IP packet forwarding only between specific network interfaces use a firewall.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPForward=
	 */
	IPForward: MaybeArray<string>;
	/**
	 * Configures IP masquerading for the network interface. If enabled, packets forwarded from the network interface will be appear as coming from the local host. Takes
	 *
	 * one of "ipv4", "ipv6", "both", or "no". Defaults to "no". If enabled, this automatically sets IPForward= to one of "ipv4", "ipv6" or "yes".
	 *
	 * Note. Any positive boolean values such as "yes" or "true" are now deprecated. Please use one of the values above.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPMasquerade=
	 */
	IPMasquerade: "ipv4" | "ipv6" | "both" | "no" | string;
	/**
	 * Configures use of stateless temporary addresses that change over time (see RFC 4941[8], Privacy Extensions for Stateless Address Autoconfiguration in IPv6). Takes a
	 *
	 * boolean or the special values "prefer-public" and "kernel". When true, enables the privacy extensions and prefers temporary addresses over public addresses. When
	 *
	 * "prefer-public", enables the privacy extensions, but prefers public addresses over temporary addresses. When false, the privacy extensions remain disabled. When
	 *
	 * "kernel", the kernel's default setting will be left in place. When unspecified, the value specified in the same setting in networkd.conf(5), which defaults to "no",
	 *
	 * will be used.
	 *
	 * Added in version 222.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6PrivacyExtensions=
	 */
	IPv6PrivacyExtensions: MaybeArray<string>;
	/**
	 * Takes a boolean. Controls IPv6 Router Advertisement (RA) reception support for the interface. If true, RAs are accepted; if false, RAs are ignored. When RAs are
	 *
	 * accepted, they may trigger the start of the DHCPv6 client if the relevant flags are set in the RA data, or if no routers are found on the link. The default is to
	 *
	 * disable RA reception for bridge devices or when IP forwarding is enabled, and to enable it otherwise. Cannot be enabled on devices aggregated in a bond device or
	 *
	 * when link-local addressing is disabled.
	 *
	 * Further settings for the IPv6 RA support may be configured in the [IPv6AcceptRA] section, see below.
	 *
	 * Also see IP Sysctl[7] in the kernel documentation regarding "accept_ra", but note that systemd's setting of 1 (i.e. true) corresponds to kernel's setting of 2.
	 *
	 * Note that kernel's implementation of the IPv6 RA protocol is always disabled, regardless of this setting. If this option is enabled, a userspace implementation of
	 *
	 * the IPv6 RA protocol is used, and the kernel's own implementation remains disabled, since systemd-networkd needs to know all details supplied in the advertisements,
	 *
	 * and these are not available from the kernel if the kernel's own implementation is used.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6AcceptRA=
	 */
	IPv6AcceptRA: MaybeArray<BooleanType>;
	/**
	 * Configures the amount of IPv6 Duplicate Address Detection (DAD) probes to send. When unset, the kernel's default will be used.
	 *
	 * Added in version 228.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6DuplicateAddressDetection=
	 */
	IPv6DuplicateAddressDetection: MaybeArray<string>;
	/**
	 * Configures IPv6 Hop Limit. Takes an integer in the range 1...255. For each router that forwards the packet, the hop limit is decremented by 1. When the hop limit
	 *
	 * field reaches zero, the packet is discarded. When unset, the kernel's default will be used.
	 *
	 * Added in version 228.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6HopLimit=
	 */
	IPv6HopLimit: MaybeArray<string>;
	/**
	 * Configure IPv4 Reverse Path Filtering. If enabled, when an IPv4 packet is received, the machine will first check whether the source of the packet would be routed
	 *
	 * through the interface it came in. If there is no route to the source on that interface, the machine will drop the packet. Takes one of "no", "strict", or "loose".
	 *
	 * When "no", no source validation will be done. When "strict", mode each incoming packet is tested against the FIB and if the incoming interface is not the best
	 *
	 * reverse path, the packet check will fail. By default failed packets are discarded. When "loose", mode each incoming packet's source address is tested against the
	 *
	 * FIB. The packet is dropped only if the source address is not reachable via any interface on that router. See RFC 3704[9]. When unset, the kernel's default will be
	 *
	 * used.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4ReversePathFilter=
	 */
	IPv4ReversePathFilter: "no" | "strict" | "loose" | string;
	/**
	 * Takes a boolean. Accept packets with local source addresses. In combination with suitable routing, this can be used to direct packets between two local interfaces
	 *
	 * over the wire and have them accepted properly. When unset, the kernel's default will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4AcceptLocal=
	 */
	IPv4AcceptLocal: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the kernel does not consider loopback addresses as martian source or destination while routing. This enables the use of 127.0.0.0/8 for
	 *
	 * local routing purposes. When unset, the kernel's default will be used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4RouteLocalnet=
	 */
	IPv4RouteLocalnet: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures proxy ARP for IPv4. Proxy ARP is the technique in which one host, usually a router, answers ARP requests intended for another machine.
	 *
	 * By "faking" its identity, the router accepts responsibility for routing packets to the "real" destination. See RFC 1027[9]. When unset, the kernel's default will be
	 *
	 * used.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4ProxyARP=
	 */
	IPv4ProxyARP: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures proxy NDP for IPv6. Proxy NDP (Neighbor Discovery Protocol) is a technique for IPv6 to allow routing of addresses to a different
	 *
	 * destination when peers expect them to be present on a certain physical link. In this case a router answers Neighbour Advertisement messages intended for another
	 *
	 * machine by offering its own MAC address as destination. Unlike proxy ARP for IPv4, it is not enabled globally, but will only send Neighbour Advertisement messages
	 *
	 * for addresses in the IPv6 neighbor proxy table, which can also be shown by ip -6 neighbour show proxy. systemd-networkd will control the per-interface `proxy_ndp`
	 *
	 * switch for each configured interface depending on this option. When unset, the kernel's default will be used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6ProxyNDP=
	 */
	IPv6ProxyNDP: MaybeArray<string>;
	/**
	 * An IPv6 address, for which Neighbour Advertisement messages will be proxied. This option may be specified more than once. systemd-networkd will add the
	 *
	 * IPv6ProxyNDPAddress= entries to the kernel's IPv6 neighbor proxy table. This setting implies IPv6ProxyNDP=yes but has no effect if IPv6ProxyNDP= has been set to
	 *
	 * false. When unset, the kernel's default will be used.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6ProxyNDPAddress=
	 */
	IPv6ProxyNDPAddress: MaybeArray<string>;
	/**
	 * Whether to enable or disable Router Advertisement sending on a link. Takes a boolean value. When enabled, prefixes configured in [IPv6Prefix] sections and routes
	 *
	 * configured in the [IPv6RoutePrefix] sections are distributed as defined in the [IPv6SendRA] section. If DHCPPrefixDelegation= is enabled, then the delegated
	 *
	 * prefixes are also distributed. See DHCPPrefixDelegation= setting and the [IPv6SendRA], [IPv6Prefix], [IPv6RoutePrefix], and [DHCPPrefixDelegation] sections for more
	 *
	 * configuration options.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6SendRA=
	 */
	IPv6SendRA: MaybeArray<string>;
	/**
	 * Takes a boolean value. When enabled, requests subnet prefixes on another link via the DHCPv6 protocol or via the 6RD option in the DHCPv4 protocol. An address
	 *
	 * within each delegated prefix will be assigned, and the prefixes will be announced through IPv6 Router Advertisement if IPv6SendRA= is enabled. This behaviour can be
	 *
	 * configured in the [DHCPPrefixDelegation] section. Defaults to disabled.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCPPrefixDelegation=
	 */
	DHCPPrefixDelegation: MaybeArray<string>;
	/**
	 * Configures IPv6 maximum transmission unit (MTU). An integer greater than or equal to 1280 bytes. When unset, the kernel's default will be used.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6MTUBytes=
	 */
	IPv6MTUBytes: MaybeArray<string>;
	/**
	 * Takes a boolean value. When enabled, the current master interface index will not be changed, and BatmanAdvanced=, Bond=, Bridge=, and VRF= settings are ignored.
	 *
	 * This may be useful when a netdev with a master interface is created by another program, e.g.  systemd-nspawn(1). Defaults to false.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KeepMaster=
	 */
	KeepMaster: MaybeArray<string>;
	/**
	 * The name of the B.A.T.M.A.N. Advanced, bond, bridge, or VRF interface to add the link to. See systemd.netdev(5).
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced=
	 */
	BatmanAdvanced: MaybeArray<string>;
	/**
	 * The name of the B.A.T.M.A.N. Advanced, bond, bridge, or VRF interface to add the link to. See systemd.netdev(5).
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced=
	 */
	Bond: MaybeArray<string>;
	/**
	 * The name of the B.A.T.M.A.N. Advanced, bond, bridge, or VRF interface to add the link to. See systemd.netdev(5).
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced=
	 */
	Bridge: MaybeArray<string>;
	/**
	 * The name of the B.A.T.M.A.N. Advanced, bond, bridge, or VRF interface to add the link to. See systemd.netdev(5).
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced=
	 */
	VRF: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	IPoIB: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	IPVLAN: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	IPVTAP: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	MACsec: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	MACVLAN: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	MACVTAP: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	Tunnel: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	VLAN: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	VXLAN: MaybeArray<string>;
	/**
	 * The name of an IPoIB, IPVLAN, IPVTAP, MACsec, MACVLAN, MACVTAP, tunnel, VLAN, VXLAN, or Xfrm to be created on the link. See systemd.netdev(5). This option may be
	 *
	 * specified more than once.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB=
	 */
	Xfrm: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies the new active slave. The "ActiveSlave=" option is only valid for following modes: "active-backup", "balance-alb", and "balance-tlb".
	 *
	 * Defaults to false.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ActiveSlave=
	 */
	ActiveSlave: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies which slave is the primary device. The specified device will always be the active slave while it is available. Only when the primary is
	 *
	 * off-line will alternate devices be used. This is useful when one slave is preferred over another, e.g. when one slave has higher throughput than another. The
	 *
	 * "PrimarySlave=" option is only valid for following modes: "active-backup", "balance-alb", and "balance-tlb". Defaults to false.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrimarySlave=
	 */
	PrimarySlave: MaybeArray<string>;
	/**
	 * Takes a boolean. Allows networkd to configure a specific link even if it has no carrier. Defaults to false. If enabled, and the IgnoreCarrierLoss= setting is not
	 *
	 * explicitly set, then it is enabled as well.
	 *
	 * With this enabled, to make the interface enter the "configured" state, which is required to make systemd-networkd-wait-online work properly for the interface, all
	 *
	 * dynamic address configuration mechanisms like DHCP= and IPv6AcceptRA= (which is enabled by default in most cases) need to be disabled. Also,
	 *
	 * DuplicateAddressDetection= (which is enabled by default for IPv4 link-local addresses and all IPv6 addresses) needs to be disabled for all static address
	 *
	 * configurations. Otherwise, without carrier, the interface will be stuck in the "configuring" state, and systemd-networkd-wait-online for the interface will timeout.
	 *
	 * Also, it is recommended to set RequiredForOnline=no-carrier to make systemd-networkd-wait-online work for the interface.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ConfigureWithoutCarrier=
	 */
	ConfigureWithoutCarrier: MaybeArray<string>;
	/**
	 * Takes a boolean or a timespan. When true, systemd-networkd retains both the static and dynamic configuration of the interface even if its carrier is lost. When
	 *
	 * false, systemd-networkd drops both the static and dynamic configuration of the interface. When a timespan is specified, systemd-networkd waits for the specified
	 *
	 * timespan, and ignores the carrier loss if the link regain its carrier within the timespan. Setting 0 seconds is equivalent to "no", and "infinite" is equivalent to
	 *
	 * "yes".
	 *
	 * Setting a finite timespan may be useful when e.g. in the following cases:
	 *
	 * •   A wireless interface connecting to a network which has multiple access points with the same SSID.
	 *
	 * •   Enslaving a wireless interface to a bond interface, which may disconnect from the connected access point and causes its carrier to be lost.
	 *
	 * •   The driver of the interface resets when the MTU is changed.
	 *
	 * When Bond= is specified to a wireless interface, defaults to 3 seconds. When the DHCPv4 client is enabled and UseMTU= in the [DHCPv4] section enabled, defaults to 5
	 *
	 * seconds. Otherwise, defaults to the value specified with ConfigureWithoutCarrier=. When ActivationPolicy= is set to "always-up", this is forced to "yes", and
	 *
	 * ignored any user specified values.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IgnoreCarrierLoss=
	 */
	IgnoreCarrierLoss: MaybeArray<string>;
	/**
	 * Takes a boolean or one of "static", "dhcp-on-stop", "dhcp". When "static", systemd-networkd will not drop static addresses and routes on starting up process. When
	 *
	 * set to "dhcp-on-stop", systemd-networkd will not drop addresses and routes on stopping the daemon. When "dhcp", the addresses and routes provided by a DHCP server
	 *
	 * will never be dropped even if the DHCP lease expires. This is contrary to the DHCP specification, but may be the best choice if, e.g., the root filesystem relies on
	 *
	 * this connection. The setting "dhcp" implies "dhcp-on-stop", and "yes" implies "dhcp" and "static". Defaults to "dhcp-on-stop" when systemd-networkd is running in
	 *
	 * initrd, "yes" when the root filesystem is a network filesystem, and "no" otherwise.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KeepConfiguration=
	 */
	KeepConfiguration: MaybeArray<string>;
}
/**
 * An [Address] section accepts the following keys. Specify several [Address] sections to configure several addresses.
 *
 */
export interface INetworkAddressOptions {
	/**
	 * As in the [Network] section. This setting is mandatory. Each [Address] section can contain one Address= setting.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address=
	 */
	Address: MaybeArray<string>;
	/**
	 * The peer address in a point-to-point connection. Accepts the same format as the Address= setting.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Peer=
	 */
	Peer: MaybeArray<string>;
	/**
	 * Takes an IPv4 address or boolean value. The address must be in the format described in inet_pton(3). If set to true, then the IPv4 broadcast address will be derived
	 *
	 * from the Address= setting. If set to false, then the broadcast address will not be set. Defaults to true, except for wireguard interfaces, where it default to
	 *
	 * false.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Broadcast=
	 */
	Broadcast: MaybeArray<string>;
	/**
	 * Specifies the label for the IPv4 address. The label must be a 7-bit ASCII string with a length of 1...15 characters. Defaults to unset.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Label=
	 */
	Label: MaybeArray<string>;
	/**
	 * Allows the default "preferred lifetime" of the address to be overridden. Only three settings are accepted: "forever", "infinity", which is the default and means
	 *
	 * that the address never expires, and "0", which means that the address is considered immediately "expired" and will not be used, unless explicitly requested. A
	 *
	 * setting of PreferredLifetime=0 is useful for addresses which are added to be used only by a specific application, which is then configured to use them explicitly.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredLifetime=
	 */
	PreferredLifetime: MaybeArray<string>;
	/**
	 * The scope of the address, which can be "global" (valid everywhere on the network, even through a gateway), "link" (only valid on this device, will not traverse a
	 *
	 * gateway) or "host" (only valid within the device itself, e.g. 127.0.0.1) or an integer in the range 0...255. Defaults to "global". IPv4 only - IPv6 scope is
	 *
	 * automatically assigned by the kernel and cannot be set manually.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Scope=
	 */
	Scope: MaybeArray<string>;
	/**
	 * The metric of the prefix route, which is pointing to the subnet of the configured IP address, taking the configured prefix length into account. Takes an unsigned
	 *
	 * integer in the range 0...4294967295. When unset or set to 0, the kernel's default value is used. This setting will be ignored when AddPrefixRoute= is false.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric=
	 */
	RouteMetric: MaybeArray<string>;
	/**
	 * Takes a boolean. Designates this address the "home address" as defined in RFC 6275[10]. Supported only on IPv6. Defaults to false.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HomeAddress=
	 */
	HomeAddress: MaybeArray<string>;
	/**
	 * Takes one of "ipv4", "ipv6", "both", or "none". When "ipv4", performs IPv4 Address Conflict Detection. See RFC 5227[11]. When "ipv6", performs IPv6 Duplicate
	 *
	 * Address Detection. See RFC 4862[12]. Defaults to "ipv4" for IPv4 link-local addresses, "ipv6" for IPv6 addresses, and "none" otherwise.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DuplicateAddressDetection=
	 */
	DuplicateAddressDetection: "ipv4" | "ipv6" | "both" | "none" | string;
	/**
	 * Takes a boolean. If true the kernel manage temporary addresses created from this one as template on behalf of Privacy Extensions RFC 3041[13]. For this to become
	 *
	 * active, the use_tempaddr sysctl setting has to be set to a value greater than zero. The given address needs to have a prefix length of 64. This flag allows using
	 *
	 * privacy extensions in a manually configured network, just like if stateless auto-configuration was active. Defaults to false.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ManageTemporaryAddress=
	 */
	ManageTemporaryAddress: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the prefix route for the address is automatically added. Defaults to true.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AddPrefixRoute=
	 */
	AddPrefixRoute: MaybeArray<string>;
	/**
	 * Takes a boolean. Joining multicast group on ethernet level via ip maddr command would not work if we have an Ethernet switch that does IGMP snooping since the
	 *
	 * switch would not replicate multicast packets on ports that did not have IGMP reports for the multicast addresses. Linux vxlan interfaces created via ip link add
	 *
	 * vxlan or networkd's netdev kind vxlan have the group option that enables them to do the required join. By extending ip address command with option "autojoin" we can
	 *
	 * get similar functionality for openvswitch (OVS) vxlan interfaces as well as other tunneling mechanisms that need to receive multicast traffic. Defaults to "no".
	 *
	 * Added in version 232.
	 *
	 * NetLabel=label
	 *
	 * This setting provides a method for integrating static and dynamic network configuration into Linux NetLabel[14] subsystem rules, used by Linux Security Modules
	 *
	 * (LSMs)[15] for network access control. The label, with suitable LSM rules, can be used to control connectivity of (for example) a service with peers in the local
	 *
	 * network. At least with SELinux, only the ingress can be controlled but not egress. The benefit of using this setting is that it may be possible to apply interface
	 *
	 * independent part of NetLabel configuration at very early stage of system boot sequence, at the time when the network interfaces are not available yet, with
	 *
	 * netlabelctl(8), and the per-interface configuration with systemd-networkd once the interfaces appear later. Currently this feature is only implemented for SELinux.
	 *
	 * The option expects a single NetLabel label. The label must conform to lexical restrictions of LSM labels. When an interface is configured with IP addresses, the
	 *
	 * addresses and subnetwork masks will be appended to the NetLabel Fallback Peer Labeling[16] rules. They will be removed when the interface is deconfigured. Failures
	 *
	 * to manage the labels will be ignored.
	 *
	 * Warning: Once labeling is enabled for network traffic, a lot of LSM access control points in Linux networking stack go from dormant to active. Care should be taken
	 *
	 * to avoid getting into a situation where for example remote connectivity is broken, when the security policy hasn't been updated to consider LSM per-packet access
	 *
	 * controls and no rules would allow any network traffic. Also note that additional configuration with netlabelctl(8) is needed.
	 *
	 * Example:
	 *
	 * [Address]
	 *
	 * NetLabel=system_u:object_r:localnet_peer_t:s0
	 *
	 * With the example rules applying for interface "eth0", when the interface is configured with an IPv4 address of 10.0.0.123/8, systemd-networkd performs the
	 *
	 * equivalent of netlabelctl operation
	 *
	 * netlabelctl unlbl add interface eth0 address:10.0.0.0/8 label:system_u:object_r:localnet_peer_t:s0
	 *
	 * and the reverse operation when the IPv4 address is deconfigured. The configuration can be used with LSM rules; in case of SELinux to allow a SELinux domain to
	 *
	 * receive data from objects of SELinux "peer" class. For example:
	 *
	 * type localnet_peer_t;
	 *
	 * allow my_server_t localnet_peer_t:peer recv;
	 *
	 * The effect of the above configuration and rules (in absence of other rules as may be the case) is to only allow "my_server_t" (and nothing else) to receive data
	 *
	 * from local subnet 10.0.0.0/8 of interface "eth0".
	 *
	 * Added in version 252.
	 *
	 * NFTSet=source:family:table:set
	 *
	 * This setting provides a method for integrating network configuration into firewall rules with NFT[17] sets. The benefit of using the setting is that static network
	 *
	 * configuration (or dynamically obtained network addresses, see similar directives in other sections) can be used in firewall rules with the indirection of NFT set
	 *
	 * types. For example, access could be granted for hosts in the local subnetwork only. Firewall rules using IP address of an interface are also instantly updated when
	 *
	 * the network configuration changes, for example via DHCP.
	 *
	 * This option expects a whitespace separated list of NFT set definitions. Each definition consists of a colon-separated tuple of source type (one of "address",
	 *
	 * "prefix" or "ifindex"), NFT address family (one of "arp", "bridge", "inet", "ip", "ip6", or "netdev"), table name and set name. The names of tables and sets must
	 *
	 * conform to lexical restrictions of NFT table names. The type of the element used in the NFT filter must match the type implied by the directive ("address", "prefix"
	 *
	 * or "ifindex") and address type (IPv4 or IPv6) as shown in the table below.
	 *
	 * Table 1. Defined source type values
	 *
	 * ┌─────────────┬─────────────────┬─────────────────────────────────────────┐
	 * │ Source type │ Description     │ Corresponding NFT type name             │
	 * ├─────────────┼─────────────────┼─────────────────────────────────────────┤
	 * │ "address"   │ host IP address │ "ipv4_addr" or "ipv6_addr"              │
	 * ├─────────────┼─────────────────┼─────────────────────────────────────────┤
	 * │ "prefix"    │ network prefix  │ "ipv4_addr" or "ipv6_addr", with "flags │
	 * │             │                 │ interval"                               │
	 * ├─────────────┼─────────────────┼─────────────────────────────────────────┤
	 * │ "ifindex"   │ interface index │ "iface_index"                           │
	 * └─────────────┴─────────────────┴─────────────────────────────────────────┘
	 * When an interface is configured with IP addresses, the addresses, subnetwork masks or interface index will be appended to the NFT sets. The information will be
	 *
	 * removed when the interface is deconfigured.  systemd-networkd only inserts elements to (or removes from) the sets, so the related NFT rules, tables and sets must be
	 *
	 * prepared elsewhere in advance. Failures to manage the sets will be ignored.
	 *
	 * Example:
	 *
	 * [Address]
	 *
	 * NFTSet=prefix:netdev:filter:eth_ipv4_prefix
	 *
	 * Corresponding NFT rules:
	 *
	 * table netdev filter {
	 *
	 * set eth_ipv4_prefix {
	 *
	 * type ipv4_addr
	 *
	 * flags interval
	 *
	 * }
	 *
	 * chain eth_ingress {
	 *
	 * type filter hook ingress device "eth0" priority filter; policy drop;
	 *
	 * ip daddr != @eth_ipv4_prefix drop
	 *
	 * accept
	 *
	 * }
	 *
	 * }
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AutoJoin=
	 */
	AutoJoin: MaybeArray<string>;
}
/**
 * A [Neighbor] section accepts the following keys. The neighbor section adds a permanent, static entry to the neighbor table (IPv6) or ARP table (IPv4) for the given
 *
 * hardware address on the links matched for the network. Specify several [Neighbor] sections to configure several static neighbors.
 *
 */
export interface INetworkNeighborOptions {
	/**
	 * The IP address of the neighbor.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address=
	 */
	Address: MaybeArray<string>;
	/**
	 * The link layer address (MAC address or IP address) of the neighbor.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LinkLayerAddress=
	 */
	LinkLayerAddress: MaybeArray<string>;
}
/**
 * An [IPv6AddressLabel] section accepts the following keys. Specify several [IPv6AddressLabel] sections to configure several address labels. IPv6 address labels are used
 *
 * for address selection. See RFC 3484[18]. Precedence is managed by userspace, and only the label itself is stored in the kernel.
 *
 */
export interface INetworkIpv6addresslabelOptions {
	/**
	 * The label for the prefix, an unsigned integer in the range 0...4294967294. 0xffffffff is reserved. This setting is mandatory.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Label=
	 */
	Label: MaybeArray<string>;
	/**
	 * IPv6 prefix is an address with a prefix length, separated by a slash "/" character. This setting is mandatory.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Prefix=
	 */
	Prefix: MaybeArray<string>;
}
/**
 * An [RoutingPolicyRule] section accepts the following settings. Specify several [RoutingPolicyRule] sections to configure several rules.
 *
 */
export interface INetworkRoutingpolicyruleOptions {
	/**
	 * This specifies the Type of Service (ToS) field of packets to match; it takes an unsigned integer in the range 0...255. The field can be used to specify precedence
	 *
	 * (the first 3 bits) and ToS (the next 3 bits). The field can be also used to specify Differentiated Services Code Point (DSCP) (the first 6 bits) and Explicit
	 *
	 * Congestion Notification (ECN) (the last 2 bits). See Type of Service[19] and Differentiated services[20] for more details.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TypeOfService=
	 */
	TypeOfService: MaybeArray<string>;
	/**
	 * Specifies the source address prefix to match. Possibly followed by a slash and the prefix length.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#From=
	 */
	From: MaybeArray<string>;
	/**
	 * Specifies the destination address prefix to match. Possibly followed by a slash and the prefix length.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#To=
	 */
	To: MaybeArray<string>;
	/**
	 * Specifies the iptables firewall mark value to match (a number in the range 1...4294967295). Optionally, the firewall mask (also a number between 1...4294967295) can
	 *
	 * be suffixed with a slash ("/"), e.g., "7/255".
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FirewallMark=
	 */
	FirewallMark: MaybeArray<string>;
	/**
	 * Specifies the routing table identifier to look up if the rule selector matches. Takes one of predefined names "default", "main", and "local", and names defined in
	 *
	 * RouteTable= in networkd.conf(5), or a number between 1 and 4294967295. Defaults to "main". Ignored if L3MasterDevice= is true.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Table=
	 */
	Table: "predefined" | "names" | "default" | "main" | "local" | "names" | "defined" | "in" | "RouteTable=" | "in" | "networkd" | string;
	/**
	 * Specifies the priority of this rule.  Priority= is an integer in the range 0...4294967295. Higher number means lower priority, and rules get processed in order of
	 *
	 * increasing number. Defaults to unset, and the kernel will pick a value dynamically.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Priority=
	 */
	Priority: MaybeArray<string>;
	/**
	 * Specifies incoming device to match. If the interface is loopback, the rule only matches packets originating from this host.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IncomingInterface=
	 */
	IncomingInterface: MaybeArray<string>;
	/**
	 * Specifies the outgoing device to match. The outgoing interface is only available for packets originating from local sockets that are bound to a device.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OutgoingInterface=
	 */
	OutgoingInterface: MaybeArray<string>;
	/**
	 * Specifies the source IP port or IP port range match in forwarding information base (FIB) rules. A port range is specified by the lower and upper port separated by a
	 *
	 * dash. Defaults to unset.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SourcePort=
	 */
	SourcePort: MaybeArray<string>;
	/**
	 * Specifies the destination IP port or IP port range match in forwarding information base (FIB) rules. A port range is specified by the lower and upper port separated
	 *
	 * by a dash. Defaults to unset.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DestinationPort=
	 */
	DestinationPort: MaybeArray<string>;
	/**
	 * Specifies the IP protocol to match in forwarding information base (FIB) rules. Takes IP protocol name such as "tcp", "udp" or "sctp", or IP protocol number such as
	 *
	 * "6" for "tcp" or "17" for "udp". Defaults to unset.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPProtocol=
	 */
	IPProtocol: MaybeArray<string>;
	/**
	 * A boolean. Specifies whether the rule is to be inverted. Defaults to false.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InvertRule=
	 */
	InvertRule: MaybeArray<string>;
	/**
	 * Takes a special value "ipv4", "ipv6", or "both". By default, the address family is determined by the address specified in To= or From=. If neither To= nor From= are
	 *
	 * specified, then defaults to "ipv4".
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Family=
	 */
	Family: MaybeArray<string>;
	/**
	 * Takes a username, a user ID, or a range of user IDs separated by a dash. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#User=
	 */
	User: MaybeArray<string>;
	/**
	 * Takes a number N in the range 0...128 and rejects routing decisions that have a prefix length of N or less. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SuppressPrefixLength=
	 */
	SuppressPrefixLength: MaybeArray<string>;
	/**
	 * Takes an integer in the range 0...2147483647 and rejects routing decisions that have an interface with the same group id. It has the same meaning as
	 *
	 * suppress_ifgroup in ip rule. Defaults to unset.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SuppressInterfaceGroup=
	 */
	SuppressInterfaceGroup: MaybeArray<string>;
	/**
	 * Specifies Routing Policy Database (RPDB) rule type. Takes one of "blackhole", "unreachable" or "prohibit".
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Type=
	 */
	Type: "blackhole" | "unreachable" | "prohibit" | string;
}
/**
 * The [NextHop] section is used to manipulate entries in the kernel's "nexthop" tables. The [NextHop] section accepts the following settings. Specify several [NextHop]
 *
 * sections to configure several hops.
 *
 */
export interface INetworkNexthopOptions {
	/**
	 * The id of the next hop. Takes an integer in the range 1...4294967295. If unspecified, then automatically chosen by kernel.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Id=
	 */
	Id: MaybeArray<string>;
	/**
	 * As in the [Network] section.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Gateway=
	 */
	Gateway: MaybeArray<string>;
	/**
	 * Takes one of the special values "ipv4" or "ipv6". By default, the family is determined by the address specified in Gateway=. If Gateway= is not specified, then
	 *
	 * defaults to "ipv4".
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Family=
	 */
	Family: "the" | "special" | "values" | "ipv4" | "ipv6" | string;
	/**
	 * Takes a boolean. If set to true, the kernel does not have to check if the gateway is reachable directly by the current machine (i.e., attached to the local
	 *
	 * network), so that we can insert the nexthop in the kernel table without it being complained about. Defaults to "no".
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OnLink=
	 */
	OnLink: MaybeArray<string>;
	/**
	 * Takes a boolean. If enabled, packets to the corresponding routes are discarded silently, and Gateway= cannot be specified. Defaults to "no".
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Blackhole=
	 */
	Blackhole: MaybeArray<string>;
	/**
	 * Takes a whitespace separated list of nexthop IDs. Each ID must be in the range 1...4294967295. Optionally, each nexthop ID can take a weight after a colon
	 *
	 * ("id[:weight]"). The weight must be in the range 1...255. If the weight is not specified, then it is assumed that the weight is 1. This setting cannot be specified
	 *
	 * with Gateway=, Family=, Blackhole=. This setting can be specified multiple times. If an empty string is assigned, then the all previous assignments are cleared.
	 *
	 * Defaults to unset.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Group=
	 */
	Group: MaybeArray<string>;
}
/**
 * The [Route] section accepts the following settings. Specify several [Route] sections to configure several routes.
 *
 */
export interface INetworkRouteOptions {
	/**
	 * Takes the gateway address or the special values "_dhcp4" and "_ipv6ra". If "_dhcp4" or "_ipv6ra" is set, then the gateway address provided by DHCPv4 or IPv6 RA is
	 *
	 * used.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Gateway=
	 */
	Gateway: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to true, the kernel does not have to check if the gateway is reachable directly by the current machine (i.e., attached to the local
	 *
	 * network), so that we can insert the route in the kernel table without it being complained about. Defaults to "no".
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#GatewayOnLink=
	 */
	GatewayOnLink: MaybeArray<string>;
	/**
	 * The destination prefix of the route. Possibly followed by a slash and the prefix length. If omitted, a full-length host route is assumed.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Destination=
	 */
	Destination: MaybeArray<string>;
	/**
	 * The source prefix of the route. Possibly followed by a slash and the prefix length. If omitted, a full-length host route is assumed.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Source=
	 */
	Source: MaybeArray<string>;
	/**
	 * The metric of the route. Takes an unsigned integer in the range 0...4294967295. Defaults to unset, and the kernel's default will be used.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Metric=
	 */
	Metric: MaybeArray<string>;
	/**
	 * Specifies the route preference as defined in RFC 4191[21] for Router Discovery messages. Which can be one of "low" the route has a lowest priority, "medium" the
	 *
	 * route has a default priority or "high" the route has a highest priority.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6Preference=
	 */
	IPv6Preference: MaybeArray<string>;
	/**
	 * The scope of the IPv4 route, which can be "global", "site", "link", "host", or "nowhere":
	 *
	 * •   "global" means the route can reach hosts more than one hop away.
	 *
	 * •   "site" means an interior route in the local autonomous system.
	 *
	 * •   "link" means the route can only reach hosts on the local network (one hop away).
	 *
	 * •   "host" means the route will not leave the local machine (used for internal addresses like 127.0.0.1).
	 *
	 * •   "nowhere" means the destination doesn't exist.
	 *
	 * For IPv4 route, defaults to "host" if Type= is "local" or "nat", and "link" if Type= is "broadcast", "multicast", "anycast", or "unicast". In other cases, defaults
	 *
	 * to "global". The value is not used for IPv6.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Scope=
	 */
	Scope: MaybeArray<string>;
	/**
	 * The preferred source address of the route. The address must be in the format described in inet_pton(3).
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredSource=
	 */
	PreferredSource: MaybeArray<string>;
	/**
	 * The table identifier for the route. Takes one of predefined names "default", "main", and "local", and names defined in RouteTable= in networkd.conf(5), or a number
	 *
	 * between 1 and 4294967295. The table can be retrieved using ip route show table num. If unset and Type= is "local", "broadcast", "anycast", or "nat", then "local" is
	 *
	 * used. In other cases, defaults to "main".
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Table=
	 */
	Table: "predefined" | "names" | "default" | "main" | "local" | "names" | "defined" | "in" | "RouteTable=" | "in" | "networkd" | string;
	/**
	 * Configures per route hop limit. Takes an integer in the range 1...255. See also IPv6HopLimit=.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HopLimit=
	 */
	HopLimit: MaybeArray<string>;
	/**
	 * The protocol identifier for the route. Takes a number between 0 and 255 or the special values "kernel", "boot", "static", "ra" and "dhcp". Defaults to "static".
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Protocol=
	 */
	Protocol: MaybeArray<string>;
	/**
	 * Specifies the type for the route. Takes one of "unicast", "local", "broadcast", "anycast", "multicast", "blackhole", "unreachable", "prohibit", "throw", "nat", and
	 *
	 * "xresolve". If "unicast", a regular route is defined, i.e. a route indicating the path to take to a destination network address. If "blackhole", packets to the
	 *
	 * defined route are discarded silently. If "unreachable", packets to the defined route are discarded and the ICMP message "Host Unreachable" is generated. If
	 *
	 * "prohibit", packets to the defined route are discarded and the ICMP message "Communication Administratively Prohibited" is generated. If "throw", route lookup in
	 *
	 * the current routing table will fail and the route selection process will return to Routing Policy Database (RPDB). Defaults to "unicast".
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Type=
	 */
	Type: "unicast" | "local" | "broadcast" | "anycast" | "multicast" | "blackhole" | "unreachable" | "prohibit" | "throw" | "nat" | "xresolve" | string;
	/**
	 * The TCP initial congestion window is used during the start of a TCP connection. During the start of a TCP session, when a client requests a resource, the server's
	 *
	 * initial congestion window determines how many packets will be sent during the initial burst of data without waiting for acknowledgement. Takes a number between 1
	 *
	 * and 1023. Note that 100 is considered an extremely large value for this option. When unset, the kernel's default (typically 10) will be used.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialCongestionWindow=
	 */
	InitialCongestionWindow: MaybeArray<string>;
	/**
	 * The TCP initial advertised receive window is the amount of receive data (in bytes) that can initially be buffered at one time on a connection. The sending host can
	 *
	 * send only that amount of data before waiting for an acknowledgment and window update from the receiving host. Takes a number between 1 and 1023. Note that 100 is
	 *
	 * considered an extremely large value for this option. When unset, the kernel's default will be used.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialAdvertisedReceiveWindow=
	 */
	InitialAdvertisedReceiveWindow: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the TCP quick ACK mode for the route is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuickAck=
	 */
	QuickAck: MaybeArray<string>;
	/**
	 * Takes a boolean. When true enables TCP fastopen without a cookie on a per-route basis. When unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FastOpenNoCookie=
	 */
	FastOpenNoCookie: MaybeArray<string>;
	/**
	 * Takes a boolean. When true enables TTL propagation at Label Switched Path (LSP) egress. When unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TTLPropagate=
	 */
	TTLPropagate: MaybeArray<string>;
	/**
	 * The maximum transmission unit in bytes to set for the route. The usual suffixes K, M, G, are supported and are understood to the base of 1024.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes=
	 */
	MTUBytes: MaybeArray<string>;
	/**
	 * Specifies the Path MSS (in bytes) hints given on TCP layer. The usual suffixes K, M, G, are supported and are understood to the base of 1024. An unsigned integer in
	 *
	 * the range 1...4294967294. When unset, the kernel's default will be used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TCPAdvertisedMaximumSegmentSize=
	 */
	TCPAdvertisedMaximumSegmentSize: MaybeArray<string>;
	/**
	 * Specifies the TCP congestion control algorithm for the route. Takes a name of the algorithm, e.g.  "bbr", "dctcp", or "vegas". When unset, the kernel's default will
	 *
	 * be used.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TCPCongestionControlAlgorithm=
	 */
	TCPCongestionControlAlgorithm: MaybeArray<string>;
	/**
	 * Specifies the TCP Retransmission Timeout (RTO) for the route. Takes time values in seconds. This value specifies the timeout of an alive TCP connection, when
	 *
	 * retransmissions remain unacknowledged. When unset, the kernel's default will be used.
	 *
	 * Added in version 255.
	 *
	 * MultiPathRoute=address[@name] [weight]
	 *
	 * Configures multipath route. Multipath routing is the technique of using multiple alternative paths through a network. Takes gateway address. Optionally, takes a
	 *
	 * network interface name or index separated with "@", and a weight in 1..256 for this multipath route separated with whitespace. This setting can be specified
	 *
	 * multiple times. If an empty string is assigned, then the all previous assignments are cleared.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TCPRetransmissionTimeoutSec=
	 */
	TCPRetransmissionTimeoutSec: string | number;
	/**
	 * Specifies the nexthop id. Takes an unsigned integer in the range 1...4294967295. If set, the corresponding [NextHop] section must be configured. Defaults to unset.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NextHop=
	 */
	NextHop: MaybeArray<string>;
}
/**
 * The [DHCPv4] section configures the DHCPv4 client, if it is enabled with the DHCP= setting described above:
 *
 */
export interface INetworkDhcpv4Options {
	/**
	 * Takes an IPv4 address. When specified, the Requested IP Address option (option code 50) is added with it to the initial DHCPDISCOVER message sent by the DHCP
	 *
	 * client. Defaults to unset, and an already assigned dynamic address to the interface is automatically picked.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequestAddress=
	 */
	RequestAddress: MaybeArray<string>;
	/**
	 * When true (the default), the machine's hostname (or the value specified with Hostname=, described below) will be sent to the DHCP server. Note that the hostname
	 *
	 * must consist only of 7-bit ASCII lower-case characters and no spaces or dots, and be formatted as a valid DNS domain name. Otherwise, the hostname is not sent even
	 *
	 * if this option is true.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendHostname=
	 */
	SendHostname: MaybeArray<string>;
	/**
	 * Use this value for the hostname which is sent to the DHCP server, instead of machine's hostname. Note that the specified hostname must consist only of 7-bit ASCII
	 *
	 * lower-case characters and no spaces or dots, and be formatted as a valid DNS domain name.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Hostname=
	 */
	Hostname: MaybeArray<string>;
	/**
	 * When configured, the specified Manufacturer Usage Description (MUD) URL will be sent to the DHCPv4 server. Takes a URL of length up to 255 characters. A superficial
	 *
	 * verification that the string is a valid URL will be performed. DHCPv4 clients are intended to have at most one MUD URL associated with them. See RFC 8520[22].
	 *
	 * MUD is an embedded software standard defined by the IETF that allows IoT device makers to advertise device specifications, including the intended communication
	 *
	 * patterns for their device when it connects to the network. The network can then use this to author a context-specific access policy, so the device functions only
	 *
	 * within those parameters.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	MUDURL: MaybeArray<string>;
	/**
	 * The DHCPv4 client identifier to use. Takes one of mac or duid. If set to mac, the MAC address of the link is used. If set to duid, an RFC4361-compliant Client ID,
	 *
	 * which is the combination of IAID and DUID, is used. IAID can be configured by IAID=. DUID can be configured by DUIDType= and DUIDRawData=. Defaults to duid.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClientIdentifier=
	 */
	ClientIdentifier: "mac" | "duid" | string;
	/**
	 * The vendor class identifier used to identify vendor type and configuration.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VendorClassIdentifier=
	 */
	VendorClassIdentifier: MaybeArray<string>;
	/**
	 * A DHCPv4 client can use UserClass option to identify the type or category of user or applications it represents. The information contained in this option is a
	 *
	 * string that represents the user class of which the client is a member. Each class sets an identifying string of information to be used by the DHCP service to
	 *
	 * classify clients. Takes a whitespace-separated list of strings.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UserClass=
	 */
	UserClass: MaybeArray<string>;
	/**
	 * Override the global DUIDType= setting for this network. See networkd.conf(5) for a description of possible values.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DUIDType=
	 */
	DUIDType: MaybeArray<string>;
	/**
	 * Override the global DUIDRawData= setting for this network. See networkd.conf(5) for a description of possible values.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DUIDRawData=
	 */
	DUIDRawData: MaybeArray<string>;
	/**
	 * The DHCP Identity Association Identifier (IAID) for the interface, a 32-bit unsigned integer.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IAID=
	 */
	IAID: MaybeArray<string>;
	/**
	 * Takes a boolean. The DHCPv4 client can obtain configuration parameters from a DHCPv4 server through a rapid two-message exchange (discover and ack). When the rapid
	 *
	 * commit option is set by both the DHCPv4 client and the DHCPv4 server, the two-message exchange is used. Otherwise, the four-message exchange (discover, offer,
	 *
	 * request, and ack) is used. The two-message exchange provides faster client configuration. See RFC 4039[23] for details. Defaults to true when Anonymize=no and
	 *
	 * neither AllowList= nor DenyList= is specified, and false otherwise.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RapidCommit=
	 */
	RapidCommit: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the options sent to the DHCP server will follow the RFC 7844[24] (Anonymity Profiles for DHCP Clients) to minimize disclosure of
	 *
	 * identifying information. Defaults to false.
	 *
	 * This option should only be set to true when MACAddressPolicy= is set to random (see systemd.link(5)).
	 *
	 * When true, ClientIdentifier=mac, RapidCommit=no, SendHostname=no, Use6RD=no, UseCaptivePortal=no, UseMTU=no, UseNTP=no, UseSIP=no, and UseTimezone=no are implied
	 *
	 * and these settings in the .network file are silently ignored. Also, Hostname=, MUDURL=, RequestAddress, RequestOptions=, SendOption=, SendVendorOption=, UserClass=,
	 *
	 * and VendorClassIdentifier= are silently ignored.
	 *
	 * With this option enabled DHCP requests will mimic those generated by Microsoft Windows, in order to reduce the ability to fingerprint and recognize installations.
	 *
	 * This means DHCP request sizes will grow and lease data will be more comprehensive than normally, though most of the requested data is not actually used.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Anonymize=
	 */
	Anonymize: MaybeArray<string>;
	/**
	 * Sets request options to be sent to the server in the DHCPv4 request options list. A whitespace-separated list of integers in the range 1...254. Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequestOptions=
	 */
	RequestOptions: MaybeArray<string>;
	/**
	 * Send an arbitrary raw option in the DHCPv4 request. Takes a DHCP option number, data type and data separated with a colon ("option:type:value"). The option number
	 *
	 * must be an integer in the range 1...254. The type takes one of "uint8", "uint16", "uint32", "ipv4address", or "string". Special characters in the data string may be
	 *
	 * escaped using C-style escapes[25]. This setting can be specified multiple times. If an empty string is specified, then all options specified earlier are cleared.
	 *
	 * Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendOption=
	 */
	SendOption: "uint8" | "uint16" | "uint32" | "ipv4address" | "string" | string;
	/**
	 * Send an arbitrary vendor option in the DHCPv4 request. Takes a DHCP option number, data type and data separated with a colon ("option:type:value"). The option
	 *
	 * number must be an integer in the range 1...254. The type takes one of "uint8", "uint16", "uint32", "ipv4address", or "string". Special characters in the data string
	 *
	 * may be escaped using C-style escapes[25]. This setting can be specified multiple times. If an empty string is specified, then all options specified earlier are
	 *
	 * cleared. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendVendorOption=
	 */
	SendVendorOption: "uint8" | "uint16" | "uint32" | "ipv4address" | "string" | string;
	/**
	 * Takes one of the special values "none", "CS6", or "CS4". When "none" no IP service type is set to the packet sent from the DHCPv4 client. When "CS6" (network
	 *
	 * control) or "CS4" (realtime), the corresponding service type will be set. Defaults to "CS6".
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPServiceType=
	 */
	IPServiceType: "the" | "special" | "values" | "none" | "CS6" | "CS4" | string;
	/**
	 * The Linux socket option SO_PRIORITY applied to the raw IP socket used for initial DHCPv4 messages. Unset by default. Usual values range from 0 to 6. More details
	 *
	 * about SO_PRIORITY socket option in socket(7). Can be used in conjunction with [VLAN] section EgressQOSMaps= setting of .netdev file to set the 802.1Q VLAN ethernet
	 *
	 * tagged header priority, see systemd.netdev(5).
	 *
	 * Added in version 253.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SocketPriority=
	 */
	SocketPriority: MaybeArray<string>;
	/**
	 * Specifies the label for the IPv4 address received from the DHCP server. The label must be a 7-bit ASCII string with a length of 1...15 characters. Defaults to
	 *
	 * unset.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Label=
	 */
	Label: MaybeArray<string>;
	/**
	 * When true (the default), the DNS servers received from the DHCP server will be used.
	 *
	 * This corresponds to the nameserver option in resolv.conf(5).
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	UseDNS: MaybeArray<string>;
	/**
	 * When true, the routes to the DNS servers received from the DHCP server will be configured. When UseDNS= is disabled, this setting is ignored. Defaults to true.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RoutesToDNS=
	 */
	RoutesToDNS: MaybeArray<string>;
	/**
	 * When true (the default), the NTP servers received from the DHCP server will be used by systemd-timesyncd.service.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseNTP=
	 */
	UseNTP: MaybeArray<string>;
	/**
	 * When true, the routes to the NTP servers received from the DHCP server will be configured. When UseNTP= is disabled, this setting is ignored. Defaults to true.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RoutesToNTP=
	 */
	RoutesToNTP: MaybeArray<string>;
	/**
	 * When true (the default), the SIP servers received from the DHCP server will be collected and made available to client programs.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseSIP=
	 */
	UseSIP: MaybeArray<string>;
	/**
	 * When true (the default), the captive portal advertised by the DHCP server will be recorded and made available to client programs and displayed in the networkctl(1)
	 *
	 * status output per-link.
	 *
	 * Added in version 254.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseCaptivePortal=
	 */
	UseCaptivePortal: MaybeArray<string>;
	/**
	 * When true, the interface maximum transmission unit from the DHCP server will be used on the current link. If MTUBytes= is set, then this setting is ignored.
	 *
	 * Defaults to false.
	 *
	 * Note, some drivers will reset the interfaces if the MTU is changed. For such interfaces, please try to use IgnoreCarrierLoss= with a short timespan, e.g.  "3
	 *
	 * seconds".
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseMTU=
	 */
	UseMTU: MaybeArray<string>;
	/**
	 * When true (the default), the hostname received from the DHCP server will be set as the transient hostname of the system.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseHostname=
	 */
	UseHostname: MaybeArray<string>;
	/**
	 * Takes a boolean, or the special value route. When true, the domain name received from the DHCP server will be used as DNS search domain over this link, similarly to
	 *
	 * the effect of the Domains= setting. If set to route, the domain name received from the DHCP server will be used for routing DNS queries only, but not for searching,
	 *
	 * similarly to the effect of the Domains= setting when the argument is prefixed with "~". Defaults to false.
	 *
	 * It is recommended to enable this option only on trusted networks, as setting this affects resolution of all hostnames, in particular of single-label names. It is
	 *
	 * generally safer to use the supplied domain only as routing domain, rather than as search domain, in order to not have it affect local resolution of single-label
	 *
	 * names.
	 *
	 * When set to true, this setting corresponds to the domain option in resolv.conf(5).
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDomains=
	 */
	UseDomains: MaybeArray<string>;
	/**
	 * When true (the default), the static routes will be requested from the DHCP server and added to the routing table with a metric of 1024, and a scope of global, link
	 *
	 * or host, depending on the route's destination and gateway. If the destination is on the local host, e.g., 127.x.x.x, or the same as the link's own address, the
	 *
	 * scope will be set to host. Otherwise if the gateway is null (a direct route), a link scope will be used. For anything else, scope defaults to global.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseRoutes=
	 */
	UseRoutes: MaybeArray<string>;
	/**
	 * Set the routing metric for routes specified by the DHCP server (including the prefix route added for the specified prefix). Takes an unsigned integer in the range
	 *
	 * 0...4294967295. Defaults to 1024.
	 *
	 * Added in version 217.
	 *
	 * RouteTable=num
	 *
	 * The table identifier for DHCP routes. Takes one of predefined names "default", "main", and "local", and names defined in RouteTable= in networkd.conf(5), or a
	 *
	 * number between 1...4294967295.
	 *
	 * When used in combination with VRF=, the VRF's routing table is used when this parameter is not specified.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric=
	 */
	RouteMetric: "predefined" | "names" | "default" | "main" | "local" | "names" | "defined" | "in" | "RouteTable=" | "in" | "networkd" | string;
	/**
	 * Specifies the MTU for the DHCP routes. Please see the [Route] section for further details.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMTUBytes=
	 */
	RouteMTUBytes: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the TCP quick ACK mode is enabled for the routes configured by the acquired DHCPv4 lease. When unset, the kernel's default will be used.
	 *
	 * Added in version 253.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuickAck=
	 */
	QuickAck: MaybeArray<string>;
	/**
	 * As in the [Route] section.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialCongestionWindow=
	 */
	InitialCongestionWindow: MaybeArray<string>;
	/**
	 * As in the [Route] section.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialAdvertisedReceiveWindow=
	 */
	InitialAdvertisedReceiveWindow: MaybeArray<string>;
	/**
	 * When true, and the DHCP server provides a Router option, the default gateway based on the router address will be configured. Defaults to unset, and the value
	 *
	 * specified with UseRoutes= will be used.
	 *
	 * Note, when the server provides both the Router and Classless Static Routes option, and UseRoutes= is enabled, the Router option is always ignored regardless of this
	 *
	 * setting. See RFC 3442[26].
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseGateway=
	 */
	UseGateway: MaybeArray<string>;
	/**
	 * When true, the timezone received from the DHCP server will be set as timezone of the local system. Defaults to false.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseTimezone=
	 */
	UseTimezone: MaybeArray<string>;
	/**
	 * When true, subnets of the received IPv6 prefix are assigned to downstream interfaces which enables DHCPPrefixDelegation=. See also DHCPPrefixDelegation= in the
	 *
	 * [Network] section, the [DHCPPrefixDelegation] section, and RFC 5969[27]. Defaults to false.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Use6RD=
	 */
	Use6RD: MaybeArray<string>;
	/**
	 * When true, the DHCPv4 configuration will be delayed by the timespan provided by the DHCP server and skip to configure dynamic IPv4 network connectivity if IPv6
	 *
	 * connectivity is provided within the timespan. See RFC 8925[28]. Defaults to false.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6OnlyMode=
	 */
	IPv6OnlyMode: MaybeArray<string>;
	/**
	 * Allows one to set DHCPv4 lease lifetime when DHCPv4 server does not send the lease lifetime. Takes one of "forever" or "infinity". If specified, the acquired
	 *
	 * address never expires. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FallbackLeaseLifetimeSec=
	 */
	FallbackLeaseLifetimeSec: "forever" | "infinity" | string;
	/**
	 * Request the server to use broadcast messages before the IP address has been configured. This is necessary for devices that cannot receive RAW packets, or that
	 *
	 * cannot receive packets at all before an IP address has been configured. On the other hand, this must not be enabled on networks where broadcasts are filtered out.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequestBroadcast=
	 */
	RequestBroadcast: MaybeArray<string>;
	/**
	 * Specifies how many times the DHCPv4 client configuration should be attempted. Takes a number or "infinity". Defaults to "infinity". Note that the time between
	 *
	 * retries is increased exponentially, up to approximately one per minute, so the network will not be overloaded even if this number is high. The default is suitable
	 *
	 * in most circumstances.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MaxAttempts=
	 */
	MaxAttempts: MaybeArray<string>;
	/**
	 * Set the port from which the DHCP client packets originate.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ListenPort=
	 */
	ListenPort: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv4 addresses. Each address can optionally take a prefix length after "/". DHCP offers from servers in the list are rejected. Note
	 *
	 * that if AllowList= is configured then DenyList= is ignored.
	 *
	 * Note that this filters only DHCP offers, so the filtering may not work when RapidCommit= is enabled. See also RapidCommit= in the above.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DenyList=
	 */
	DenyList: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv4 addresses. Each address can optionally take a prefix length after "/". DHCP offers from servers in the list are accepted.
	 *
	 * Note that this filters only DHCP offers, so the filtering may not work when RapidCommit= is enabled. See also RapidCommit= in the above.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AllowList=
	 */
	AllowList: MaybeArray<string>;
	/**
	 * When true, the DHCPv4 client sends a DHCP release packet when it stops. Defaults to true.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendRelease=
	 */
	SendRelease: MaybeArray<string>;
	/**
	 * A boolean. When true, systemd-networkd performs IPv4 Duplicate Address Detection to the acquired address by the DHCPv4 client. If duplicate is detected, the DHCPv4
	 *
	 * client rejects the address by sending a DHCPDECLINE packet to the DHCP server, and tries to obtain an IP address again. See RFC 5227[11]. Defaults to false.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendDecline=
	 */
	SendDecline: MaybeArray<string>;
	/**
	 * This applies the NetLabel for the addresses received with DHCP, like NetLabel= in [Address] section applies it to statically configured addresses. See NetLabel= in
	 *
	 * [Address] section for more details.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel=
	 */
	NetLabel: MaybeArray<string>;
	/**
	 * This applies the NFT set for the network configuration received with DHCP, like NFTSet= in [Address] section applies it to static configuration. See NFTSet= in
	 *
	 * [Address] section for more details. For "address" or "prefix" source types, the type of the element used in the NFT filter must be "ipv4_addr".
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NFTSet=
	 */
	NFTSet: MaybeArray<string>;
}
/**
 * The [DHCPv6] section configures the DHCPv6 client, if it is enabled with the DHCP= setting described above, or invoked by the IPv6 Router Advertisement:
 *
 */
export interface INetworkDhcpv6Options {
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	MUDURL: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	IAID: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	DUIDType: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	DUIDRawData: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	RequestOptions: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section, however because DHCPv6 uses 16-bit fields to store option numbers, the option number is an integer in the range 1...65536.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendOption=
	 */
	SendOption: MaybeArray<string>;
	/**
	 * Send an arbitrary vendor option in the DHCPv6 request. Takes an enterprise identifier, DHCP option number, data type, and data separated with a colon ("enterprise
	 *
	 * identifier:option:type:value"). Enterprise identifier is an unsigned integer in the range 1...4294967294. The option number must be an integer in the range 1...254.
	 *
	 * Data type takes one of "uint8", "uint16", "uint32", "ipv4address", "ipv6address", or "string". Special characters in the data string may be escaped using C-style
	 *
	 * escapes[25]. This setting can be specified multiple times. If an empty string is specified, then all options specified earlier are cleared. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendVendorOption=
	 */
	SendVendorOption: "uint8" | "uint16" | "uint32" | "ipv4address" | "ipv6address" | "string" | string;
	/**
	 * A DHCPv6 client can use User Class option to identify the type or category of user or applications it represents. The information contained in this option is a
	 *
	 * string that represents the user class of which the client is a member. Each class sets an identifying string of information to be used by the DHCP service to
	 *
	 * classify clients. Special characters in the data string may be escaped using C-style escapes[25]. This setting can be specified multiple times. If an empty string
	 *
	 * is specified, then all options specified earlier are cleared. Takes a whitespace-separated list of strings. Note that currently NUL bytes are not allowed.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UserClass=
	 */
	UserClass: MaybeArray<string>;
	/**
	 * A DHCPv6 client can use VendorClass option to identify the vendor that manufactured the hardware on which the client is running. The information contained in the
	 *
	 * data area of this option is contained in one or more opaque fields that identify details of the hardware configuration. Takes a whitespace-separated list of
	 *
	 * strings.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VendorClass=
	 */
	VendorClass: MaybeArray<string>;
	/**
	 * Takes an IPv6 address with prefix length in the same format as the Address= in the [Network] section. The DHCPv6 client will include a prefix hint in the DHCPv6
	 *
	 * solicitation sent to the server. The prefix length must be in the range 1...128. Defaults to unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrefixDelegationHint=
	 */
	PrefixDelegationHint: MaybeArray<string>;
	/**
	 * Takes a boolean. The DHCPv6 client can obtain configuration parameters from a DHCPv6 server through a rapid two-message exchange (solicit and reply). When the rapid
	 *
	 * commit option is set by both the DHCPv6 client and the DHCPv6 server, the two-message exchange is used. Otherwise, the four-message exchange (solicit, advertise,
	 *
	 * request, and reply) is used. The two-message exchange provides faster client configuration. See RFC 3315[29] for details. Defaults to true, and the two-message
	 *
	 * exchange will be used if the server support it.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RapidCommit=
	 */
	RapidCommit: MaybeArray<string>;
	/**
	 * When true (the default), the machine's hostname (or the value specified with Hostname=, described below) will be sent to the DHCPv6 server. Note that the hostname
	 *
	 * must consist only of 7-bit ASCII lower-case characters and no spaces or dots, and be formatted as a valid DNS domain name. Otherwise, the hostname is not sent even
	 *
	 * if this option is true.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendHostname=
	 */
	SendHostname: MaybeArray<string>;
	/**
	 * Use this value for the hostname which is sent to the DHCPv6 server, instead of machine's hostname. Note that the specified hostname must consist only of 7-bit ASCII
	 *
	 * lower-case characters and no spaces or dots, and be formatted as a valid DNS domain name.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Hostname=
	 */
	Hostname: MaybeArray<string>;
	/**
	 * When true (the default), the IP addresses provided by the DHCPv6 server will be assigned.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseAddress=
	 */
	UseAddress: MaybeArray<string>;
	/**
	 * When true (the default), the captive portal advertised by the DHCPv6 server will be recorded and made available to client programs and displayed in the
	 *
	 * networkctl(1) status output per-link.
	 *
	 * Added in version 254.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseCaptivePortal=
	 */
	UseCaptivePortal: MaybeArray<string>;
	/**
	 * When true (the default), the client will request the DHCPv6 server to delegate prefixes. If the server provides prefixes to be delegated, then subnets of the
	 *
	 * prefixes are assigned to the interfaces that have DHCPPrefixDelegation=yes. See also the DHCPPrefixDelegation= setting in the [Network] section, settings in the
	 *
	 * [DHCPPrefixDelegation] section, and RFC 8415[30].
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDelegatedPrefix=
	 */
	UseDelegatedPrefix: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	UseDNS: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	UseNTP: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	UseHostname: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	UseDomains: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	NetLabel: MaybeArray<string>;
	/**
	 * As in the [DHCPv4] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	SendRelease: MaybeArray<string>;
	/**
	 * This applies the NFT set for the network configuration received with DHCP, like NFTSet= in [Address] section applies it to static configuration. See NFTSet= in
	 *
	 * [Address] section for more details. For "address" or "prefix" source types, the type of the element used in the NFT filter must be "ipv6_addr".
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NFTSet=
	 */
	NFTSet: MaybeArray<string>;
	/**
	 * Allows DHCPv6 client to start without router advertisements's "managed" or "other configuration" flag. Takes one of "no", "solicit", or "information-request". If
	 *
	 * this is not specified, "solicit" is used when DHCPPrefixDelegation= is enabled and UplinkInterface=:self is specified in the [DHCPPrefixDelegation] section.
	 *
	 * Otherwise, defaults to "no", and the DHCPv6 client will be started when an RA is received. See also the DHCPv6Client= setting in the [IPv6AcceptRA] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#WithoutRA=
	 */
	WithoutRA: "no" | "solicit" | "information-request" | string;
}
/**
 * The [DHCPPrefixDelegation] section configures subnet prefixes of the delegated prefixes acquired by a DHCPv6 client or by a DHCPv4 client through the 6RD option on
 *
 * another interface. The settings in this section are used only when the DHCPPrefixDelegation= setting in the [Network] section is enabled.
 *
 */
export interface INetworkDhcpprefixdelegationOptions {
	/**
	 * Specifies the name or the index of the uplink interface, or one of the special values ":self" and ":auto". When ":self", the interface itself is considered the
	 *
	 * uplink interface, and WithoutRA=solicit is implied if the setting is not explicitly specified. When ":auto", the first link which acquired prefixes to be delegated
	 *
	 * from the DHCPv6 or DHCPv4 server is selected. Defaults to ":auto".
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UplinkInterface=
	 */
	UplinkInterface: MaybeArray<string>;
	/**
	 * Configure a specific subnet ID on the interface from a (previously) received prefix delegation. You can either set "auto" (the default) or a specific subnet ID (as
	 *
	 * defined in RFC 4291[31], section 2.5.4), in which case the allowed value is hexadecimal, from 0 to 0x7fffffffffffffff inclusive.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SubnetId=
	 */
	SubnetId: MaybeArray<string>;
	/**
	 * Takes a boolean. When enabled, and IPv6SendRA= in [Network] section is enabled, the delegated prefixes are distributed through the IPv6 Router Advertisement. This
	 *
	 * setting will be ignored when the DHCPPrefixDelegation= setting is enabled on the upstream interface. Defaults to yes.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Announce=
	 */
	Announce: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies whether to add an address from the delegated prefixes which are received from the WAN interface by the DHCPv6 Prefix Delegation. When
	 *
	 * true (on LAN interface), the EUI-64 algorithm will be used by default to form an interface identifier from the delegated prefixes. See also Token= setting below.
	 *
	 * Defaults to yes.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Assign=
	 */
	Assign: MaybeArray<string>;
	/**
	 * Specifies an optional address generation mode for assigning an address in each delegated prefix. This accepts the same syntax as Token= in the [IPv6AcceptRA]
	 *
	 * section. If Assign= is set to false, then this setting will be ignored. Defaults to unset, which means the EUI-64 algorithm will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Token=
	 */
	Token: MaybeArray<string>;
	/**
	 * As in the [Address] section, but defaults to true.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ManageTemporaryAddress=
	 */
	ManageTemporaryAddress: MaybeArray<string>;
	/**
	 * The metric of the route to the delegated prefix subnet. Takes an unsigned integer in the range 0...4294967295. When set to 0, the kernel's default value is used.
	 *
	 * Defaults to 256.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric=
	 */
	RouteMetric: MaybeArray<string>;
	/**
	 * This applies the NetLabel for the addresses received with DHCP, like NetLabel= in [Address] section applies it to statically configured addresses. See NetLabel= in
	 *
	 * [Address] section for more details.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel=
	 */
	NetLabel: MaybeArray<string>;
	/**
	 * This applies the NFT set for the network configuration received with DHCP, like NFTSet= in [Address] section applies it to static configuration. See NFTSet= in
	 *
	 * [Address] section for more details. For "address" or "prefix" source types, the type of the element used in the NFT filter must be "ipv6_addr".
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NFTSet=
	 */
	NFTSet: MaybeArray<string>;
}
/**
 * The [IPv6AcceptRA] section configures the IPv6 Router Advertisement (RA) client, if it is enabled with the IPv6AcceptRA= setting described above:
 *
 */
export interface INetworkIpv6acceptraOptions {
	/**
	 * Specifies an optional address generation mode for the Stateless Address Autoconfiguration (SLAAC). The following values are supported:
	 *
	 * eui64
	 *
	 * The EUI-64 algorithm will be used to generate an address for that prefix. Only supported by Ethernet or InfiniBand interfaces.
	 *
	 * Added in version 250.
	 *
	 * static:ADDRESS
	 *
	 * An IPv6 address must be specified after a colon (":"), and the lower bits of the supplied address are combined with the upper bits of a prefix received in a
	 *
	 * Router Advertisement (RA) message to form a complete address. Note that if multiple prefixes are received in an RA message, or in multiple RA messages,
	 *
	 * addresses will be formed from each of them using the supplied address. This mode implements SLAAC but uses a static interface identifier instead of an
	 *
	 * identifier generated by using the EUI-64 algorithm. Because the interface identifier is static, if Duplicate Address Detection detects that the computed address
	 *
	 * is a duplicate (in use by another node on the link), then this mode will fail to provide an address for that prefix. If an IPv6 address without mode is
	 *
	 * specified, then "static" mode is assumed.
	 *
	 * Added in version 250.
	 *
	 * prefixstable[:ADDRESS][,UUID]
	 *
	 * The algorithm specified in RFC 7217[32] will be used to generate interface identifiers. This mode can optionally take an IPv6 address separated with a colon
	 *
	 * (":"). If an IPv6 address is specified, then an interface identifier is generated only when a prefix received in an RA message matches the supplied address.
	 *
	 * This mode can also optionally take a non-null UUID in the format which sd_id128_from_string() accepts, e.g.  "86b123b969ba4b7eb8b3d8605123525a" or
	 *
	 * "86b123b9-69ba-4b7e-b8b3-d8605123525a". If a UUID is specified, the value is used as the secret key to generate interface identifiers. If not specified, then an
	 *
	 * application specific ID generated with the system's machine-ID will be used as the secret key. See sd-id128(3), sd_id128_from_string(3), and
	 *
	 * sd_id128_get_machine(3).
	 *
	 * Note that the "prefixstable" algorithm uses both the interface name and MAC address as input to the hash to compute the interface identifier, so if either of
	 *
	 * those are changed the resulting interface identifier (and address) will be changed, even if the prefix received in the RA message has not been changed.
	 *
	 * Added in version 250.
	 *
	 * If no address generation mode is specified (which is the default), or a received prefix does not match any of the addresses provided in "prefixstable" mode, then
	 *
	 * the EUI-64 algorithm will be used for Ethernet or InfiniBand interfaces, otherwise "prefixstable" will be used to form an interface identifier for that prefix.
	 *
	 * This setting can be specified multiple times. If an empty string is assigned, then the all previous assignments are cleared.
	 *
	 * Examples:
	 *
	 * Token=eui64
	 *
	 * Token=::1a:2b:3c:4d
	 *
	 * Token=static:::1a:2b:3c:4d
	 *
	 * Token=prefixstable
	 *
	 * Token=prefixstable:2002:da8:1::
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Token=
	 */
	Token: MaybeArray<string>;
	/**
	 * When true (the default), the DNS servers received in the Router Advertisement will be used.
	 *
	 * This corresponds to the nameserver option in resolv.conf(5).
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS=
	 */
	UseDNS: MaybeArray<string>;
	/**
	 * Takes a boolean, or the special value "route". When true, the domain name received via IPv6 Router Advertisement (RA) will be used as DNS search domain over this
	 *
	 * link, similarly to the effect of the Domains= setting. If set to "route", the domain name received via IPv6 RA will be used for routing DNS queries only, but not
	 *
	 * for searching, similarly to the effect of the Domains= setting when the argument is prefixed with "~". Defaults to false.
	 *
	 * It is recommended to enable this option only on trusted networks, as setting this affects resolution of all hostnames, in particular of single-label names. It is
	 *
	 * generally safer to use the supplied domain only as routing domain, rather than as search domain, in order to not have it affect local resolution of single-label
	 *
	 * names.
	 *
	 * When set to true, this setting corresponds to the domain option in resolv.conf(5).
	 *
	 * Added in version 231.
	 *
	 * RouteTable=num
	 *
	 * The table identifier for the routes received in the Router Advertisement. Takes one of predefined names "default", "main", and "local", and names defined in
	 *
	 * RouteTable= in networkd.conf(5), or a number between 1...4294967295.
	 *
	 * When used in combination with VRF=, the VRF's routing table is used when this parameter is not specified.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDomains=
	 */
	UseDomains: "predefined" | "names" | "default" | "main" | "local" | "names" | "defined" | "in" | "RouteTable=" | "in" | "networkd" | string;
	/**
	 * Set the routing metric for the routes received in the Router Advertisement. Takes an unsigned integer in the range 0...4294967295, or three unsigned integer
	 *
	 * separated with ":", in that case the first one is used when the router preference is high, the second is for medium preference, and the last is for low preference
	 *
	 * ("high:medium:low"). Defaults to "512:1024:2048".
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric=
	 */
	RouteMetric: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the TCP quick ACK mode is enabled for the routes configured by the received RAs. When unset, the kernel's default will be used.
	 *
	 * Added in version 253.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuickAck=
	 */
	QuickAck: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the MTU received in the Router Advertisement will be used. Defaults to true.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseMTU=
	 */
	UseMTU: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the hop limit received in the Router Advertisement will be set to routes configured based on the advertisement. See also IPv6HopLimit=.
	 *
	 * Defaults to true.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseHopLimit=
	 */
	UseHopLimit: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the ICMP6 rate limit received in the Router Advertisement will be set to ICMP6 rate limit based on the advertisement. Defaults to true.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseICMP6RateLimit=
	 */
	UseICMP6RateLimit: MaybeArray<string>;
	/**
	 * When true (the default), the router address will be configured as the default gateway.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseGateway=
	 */
	UseGateway: MaybeArray<string>;
	/**
	 * When true (the default), the routes corresponding to the route prefixes received in the Router Advertisement will be configured.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseRoutePrefix=
	 */
	UseRoutePrefix: MaybeArray<string>;
	/**
	 * When true (the default), the captive portal received in the Router Advertisement will be recorded and made available to client programs and displayed in the
	 *
	 * networkctl(1) status output per-link.
	 *
	 * Added in version 254.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseCaptivePortal=
	 */
	UseCaptivePortal: MaybeArray<string>;
	/**
	 * When true, the IPv6 PREF64 (or NAT64) prefixes received in the Router Advertisement will be recorded and made available to client programs and displayed in the
	 *
	 * networkctl(1) status output per-link. See RFC 8781[33]. Defaults to false.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UsePREF64=
	 */
	UsePREF64: MaybeArray<string>;
	/**
	 * When true (the default), the autonomous prefix received in the Router Advertisement will be used and take precedence over any statically configured ones.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseAutonomousPrefix=
	 */
	UseAutonomousPrefix: MaybeArray<string>;
	/**
	 * When true (the default), the onlink prefix received in the Router Advertisement will be used and takes precedence over any statically configured ones.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseOnLinkPrefix=
	 */
	UseOnLinkPrefix: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv6 router addresses. Each address can optionally take a prefix length after "/". Any information advertised by the listed router is
	 *
	 * ignored.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterDenyList=
	 */
	RouterDenyList: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv6 router addresses. Each address can optionally take a prefix length after "/". Only information advertised by the listed router
	 *
	 * is accepted. Note that if RouterAllowList= is configured then RouterDenyList= is ignored.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterAllowList=
	 */
	RouterAllowList: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv6 prefixes. Each prefix can optionally take its prefix length after "/". IPv6 prefixes supplied via router advertisements in the
	 *
	 * list are ignored.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrefixDenyList=
	 */
	PrefixDenyList: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv6 prefixes. Each prefix can optionally take its prefix length after "/". IPv6 prefixes supplied via router advertisements in the
	 *
	 * list are allowed. Note that if PrefixAllowList= is configured then PrefixDenyList= is ignored.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrefixAllowList=
	 */
	PrefixAllowList: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv6 route prefixes. Each prefix can optionally take its prefix length after "/". IPv6 route prefixes supplied via router
	 *
	 * advertisements in the list are ignored.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteDenyList=
	 */
	RouteDenyList: MaybeArray<string>;
	/**
	 * A whitespace-separated list of IPv6 route prefixes. Each prefix can optionally take its prefix length after "/". IPv6 route prefixes supplied via router
	 *
	 * advertisements in the list are allowed. Note that if RouteAllowList= is configured then RouteDenyList= is ignored.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteAllowList=
	 */
	RouteAllowList: MaybeArray<string>;
	/**
	 * Takes a boolean, or the special value "always". When true, the DHCPv6 client will be started in "solicit" mode if the RA has the "managed" flag or
	 *
	 * "information-request" mode if the RA lacks the "managed" flag but has the "other configuration" flag. If set to "always", the DHCPv6 client will be started in
	 *
	 * "solicit" mode when an RA is received, even if neither the "managed" nor the "other configuration" flag is set in the RA. This will be ignored when WithoutRA= in
	 *
	 * the [DHCPv6] section is enabled, or UplinkInterface=:self in the [DHCPPrefixDelegation] section is specified. Defaults to true.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCPv6Client=
	 */
	DHCPv6Client: MaybeArray<string>;
	/**
	 * This applies the NetLabel for the addresses received with RA, like NetLabel= in [Address] section applies it to statically configured addresses. See NetLabel= in
	 *
	 * [Address] section for more details.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel=
	 */
	NetLabel: MaybeArray<string>;
	/**
	 * This applies the NFT set for the network configuration received with RA, like NFTSet= in [Address] section applies it to static configuration. See NFTSet= in
	 *
	 * [Address] section for more details. For "address" or "prefix" source types, the type of the element used in the NFT filter must be "ipv6_addr".
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NFTSet=
	 */
	NFTSet: MaybeArray<string>;
}
/**
 * The [DHCPServer] section contains settings for the DHCP server, if enabled via the DHCPServer= option described above:
 *
 */
export interface INetworkDhcpserverOptions {
	/**
	 * Specifies the server address for the DHCP server. Takes an IPv4 address with prefix length separated with a slash, e.g.  "192.168.0.1/24". Defaults to unset, and
	 *
	 * one of static IPv4 addresses configured in [Network] or [Address] section will be automatically selected. This setting may be useful when the interface on which the
	 *
	 * DHCP server is running has multiple static IPv4 addresses.
	 *
	 * This implies Address= in [Network] or [Address] section with the same address and prefix length. That is,
	 *
	 * [Network]
	 *
	 * DHCPServer=yes
	 *
	 * Address=192.168.0.1/24
	 *
	 * Address=192.168.0.2/24
	 *
	 * [DHCPServer]
	 *
	 * ServerAddress=192.168.0.1/24
	 *
	 * or
	 *
	 * [Network]
	 *
	 * DHCPServer=yes
	 *
	 * [Address]
	 *
	 * Address=192.168.0.1/24
	 *
	 * [Address]
	 *
	 * Address=192.168.0.2/24
	 *
	 * [DHCPServer]
	 *
	 * ServerAddress=192.168.0.1/24
	 *
	 * are equivalent to the following:
	 *
	 * [Network]
	 *
	 * DHCPServer=yes
	 *
	 * Address=192.168.0.2/24
	 *
	 * [DHCPServer]
	 *
	 * ServerAddress=192.168.0.1/24
	 *
	 * Since version 255, like the Address= setting in [Network] or [Address] section, this also supports a null address, e.g.  "0.0.0.0/24", and an unused address will be
	 *
	 * automatically selected. For more details about the automatic address selection, see Address= setting in [Network] section in the above.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ServerAddress=
	 */
	ServerAddress: MaybeArray<string>;
	/**
	 * Configures the pool of addresses to hand out. The pool is a contiguous sequence of IP addresses in the subnet configured for the server address, which does not
	 *
	 * include the subnet nor the broadcast address.  PoolOffset= takes the offset of the pool from the start of subnet, or zero to use the default value.  PoolSize= takes
	 *
	 * the number of IP addresses in the pool or zero to use the default value. By default, the pool starts at the first address after the subnet address and takes up the
	 *
	 * rest of the subnet, excluding the broadcast address. If the pool includes the server address (the default), this is reserved and not handed out to clients.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PoolOffset=
	 */
	PoolOffset: MaybeArray<string>;
	/**
	 * Configures the pool of addresses to hand out. The pool is a contiguous sequence of IP addresses in the subnet configured for the server address, which does not
	 *
	 * include the subnet nor the broadcast address.  PoolOffset= takes the offset of the pool from the start of subnet, or zero to use the default value.  PoolSize= takes
	 *
	 * the number of IP addresses in the pool or zero to use the default value. By default, the pool starts at the first address after the subnet address and takes up the
	 *
	 * rest of the subnet, excluding the broadcast address. If the pool includes the server address (the default), this is reserved and not handed out to clients.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PoolOffset=
	 */
	PoolSize: MaybeArray<string>;
	/**
	 * Control the default and maximum DHCP lease time to pass to clients. These settings take time values in seconds or another common time unit, depending on the suffix.
	 *
	 * The default lease time is used for clients that did not ask for a specific lease time. If a client asks for a lease time longer than the maximum lease time, it is
	 *
	 * automatically shortened to the specified time. The default lease time defaults to 1h, the maximum lease time to 12h. Shorter lease times are beneficial if the
	 *
	 * configuration data in DHCP leases changes frequently and clients shall learn the new settings with shorter latencies. Longer lease times reduce the generated DHCP
	 *
	 * network traffic.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultLeaseTimeSec=
	 */
	DefaultLeaseTimeSec: MaybeArray<string>;
	/**
	 * Control the default and maximum DHCP lease time to pass to clients. These settings take time values in seconds or another common time unit, depending on the suffix.
	 *
	 * The default lease time is used for clients that did not ask for a specific lease time. If a client asks for a lease time longer than the maximum lease time, it is
	 *
	 * automatically shortened to the specified time. The default lease time defaults to 1h, the maximum lease time to 12h. Shorter lease times are beneficial if the
	 *
	 * configuration data in DHCP leases changes frequently and clients shall learn the new settings with shorter latencies. Longer lease times reduce the generated DHCP
	 *
	 * network traffic.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultLeaseTimeSec=
	 */
	MaxLeaseTimeSec: MaybeArray<string>;
	/**
	 * Specifies the name or the index of the uplink interface, or one of the special values ":none" and ":auto". When emitting DNS, NTP, or SIP servers is enabled but no
	 *
	 * servers are specified, the servers configured in the uplink interface will be emitted. When ":auto", the link which has a default gateway with the highest priority
	 *
	 * will be automatically selected. When ":none", no uplink interface will be selected. Defaults to ":auto".
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UplinkInterface=
	 */
	UplinkInterface: MaybeArray<string>;
	/**
	 * EmitDNS= takes a boolean. Configures whether the DHCP leases handed out to clients shall contain DNS server information. Defaults to "yes". The DNS servers to pass
	 *
	 * to clients may be configured with the DNS= option, which takes a list of IPv4 addresses, or special value "_server_address" which will be converted to the address
	 *
	 * used by the DHCP server.
	 *
	 * If the EmitDNS= option is enabled but no servers configured, the servers are automatically propagated from an "uplink" interface that has appropriate servers set.
	 *
	 * The "uplink" interface is determined by the default route of the system with the highest priority. Note that this information is acquired at the time the lease is
	 *
	 * handed out, and does not take uplink interfaces into account that acquire DNS server information at a later point. If no suitable uplink interface is found the DNS
	 *
	 * server data from /etc/resolv.conf is used. Also, note that the leases are not refreshed if the uplink network configuration changes. To ensure clients regularly
	 *
	 * acquire the most current uplink DNS server information, it is thus advisable to shorten the DHCP lease time via MaxLeaseTimeSec= described above.
	 *
	 * This setting can be specified multiple times. If an empty string is specified, then all DNS servers specified earlier are cleared.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS=
	 */
	EmitDNS: MaybeArray<string>;
	/**
	 * EmitDNS= takes a boolean. Configures whether the DHCP leases handed out to clients shall contain DNS server information. Defaults to "yes". The DNS servers to pass
	 *
	 * to clients may be configured with the DNS= option, which takes a list of IPv4 addresses, or special value "_server_address" which will be converted to the address
	 *
	 * used by the DHCP server.
	 *
	 * If the EmitDNS= option is enabled but no servers configured, the servers are automatically propagated from an "uplink" interface that has appropriate servers set.
	 *
	 * The "uplink" interface is determined by the default route of the system with the highest priority. Note that this information is acquired at the time the lease is
	 *
	 * handed out, and does not take uplink interfaces into account that acquire DNS server information at a later point. If no suitable uplink interface is found the DNS
	 *
	 * server data from /etc/resolv.conf is used. Also, note that the leases are not refreshed if the uplink network configuration changes. To ensure clients regularly
	 *
	 * acquire the most current uplink DNS server information, it is thus advisable to shorten the DHCP lease time via MaxLeaseTimeSec= described above.
	 *
	 * This setting can be specified multiple times. If an empty string is specified, then all DNS servers specified earlier are cleared.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS=
	 */
	DNS: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	EmitNTP: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	NTP: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	EmitSIP: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	SIP: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	EmitPOP3: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	POP3: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	EmitSMTP: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	SMTP: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	EmitLPR: MaybeArray<string>;
	/**
	 * Similar to the EmitDNS= and DNS= settings described above, these settings configure whether and what server information for the indicate protocol shall be emitted
	 *
	 * as part of the DHCP lease. The same syntax, propagation semantics and defaults apply as for EmitDNS= and DNS=.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP=
	 */
	LPR: MaybeArray<string>;
	/**
	 * The EmitRouter= setting takes a boolean value, and configures whether the DHCP lease should contain the router option. The Router= setting takes an IPv4 address,
	 *
	 * and configures the router address to be emitted. When the Router= setting is not specified, then the server address will be used for the router option. When the
	 *
	 * EmitRouter= setting is disabled, the Router= setting will be ignored. The EmitRouter= setting defaults to true, and the Router= setting defaults to unset.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitRouter=
	 */
	EmitRouter: MaybeArray<string>;
	/**
	 * The EmitRouter= setting takes a boolean value, and configures whether the DHCP lease should contain the router option. The Router= setting takes an IPv4 address,
	 *
	 * and configures the router address to be emitted. When the Router= setting is not specified, then the server address will be used for the router option. When the
	 *
	 * EmitRouter= setting is disabled, the Router= setting will be ignored. The EmitRouter= setting defaults to true, and the Router= setting defaults to unset.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitRouter=
	 */
	Router: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether the DHCP leases handed out to clients shall contain timezone information. Defaults to "yes". The Timezone= setting takes a
	 *
	 * timezone string (such as "Europe/Berlin" or "UTC") to pass to clients. If no explicit timezone is set, the system timezone of the local host is propagated, as
	 *
	 * determined by the /etc/localtime symlink.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitTimezone=
	 */
	EmitTimezone: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether the DHCP leases handed out to clients shall contain timezone information. Defaults to "yes". The Timezone= setting takes a
	 *
	 * timezone string (such as "Europe/Berlin" or "UTC") to pass to clients. If no explicit timezone is set, the system timezone of the local host is propagated, as
	 *
	 * determined by the /etc/localtime symlink.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitTimezone=
	 */
	Timezone: MaybeArray<string>;
	/**
	 * Takes an IPv4 address of the boot server used by e.g. PXE boot systems. When specified, this address is sent in the siaddr field of the DHCP message header. See RFC
	 *
	 * 2131[34] for more details. Defaults to unset.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BootServerAddress=
	 */
	BootServerAddress: MaybeArray<string>;
	/**
	 * Takes a name of the boot server used by e.g. PXE boot systems. When specified, this name is sent in the DHCP option 66 ("TFTP server name"). See RFC 2132[35] for
	 *
	 * more details. Defaults to unset.
	 *
	 * Note that typically setting one of BootServerName= or BootServerAddress= is sufficient, but both can be set too, if desired.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BootServerName=
	 */
	BootServerName: MaybeArray<string>;
	/**
	 * Takes a path or URL to a file loaded by e.g. a PXE boot loader. When specified, this path is sent in the DHCP option 67 ("Bootfile name"). See RFC 2132[35] for more
	 *
	 * details. Defaults to unset.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BootFilename=
	 */
	BootFilename: MaybeArray<string>;
	/**
	 * Takes a timespan. Controls the RFC 8925[28] IPv6-Only Preferred option. Specifies the DHCPv4 option to indicate that a host supports an IPv6-only mode and is
	 *
	 * willing to forgo obtaining an IPv4 address if the network provides IPv6 connectivity. Defaults to unset, and not send the option. The minimum allowed value is 300
	 *
	 * seconds.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6OnlyPreferredSec=
	 */
	IPv6OnlyPreferredSec: MaybeArray<string>;
	/**
	 * Send a raw option with value via DHCPv4 server. Takes a DHCP option number, data type and data ("option:type:value"). The option number is an integer in the range
	 *
	 * 1...254. The type takes one of "uint8", "uint16", "uint32", "ipv4address", "ipv6address", or "string". Special characters in the data string may be escaped using
	 *
	 * C-style escapes[25]. This setting can be specified multiple times. If an empty string is specified, then all options specified earlier are cleared. Defaults to
	 *
	 * unset.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendOption=
	 */
	SendOption: "uint8" | "uint16" | "uint32" | "ipv4address" | "ipv6address" | "string" | string;
	/**
	 * Send a vendor option with value via DHCPv4 server. Takes a DHCP option number, data type and data ("option:type:value"). The option number is an integer in the
	 *
	 * range 1...254. The type takes one of "uint8", "uint16", "uint32", "ipv4address", or "string". Special characters in the data string may be escaped using C-style
	 *
	 * escapes[25]. This setting can be specified multiple times. If an empty string is specified, then all options specified earlier are cleared. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendVendorOption=
	 */
	SendVendorOption: "uint8" | "uint16" | "uint32" | "ipv4address" | "string" | string;
	/**
	 * Takes a boolean value. When "yes", DHCP server socket will be bound to its network interface and all socket communication will be restricted to this interface.
	 *
	 * Defaults to "yes", except if RelayTarget= is used (see below), in which case it defaults to "no".
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BindToInterface=
	 */
	BindToInterface: MaybeArray<string>;
	/**
	 * Takes an IPv4 address, which must be in the format described in inet_pton(3). Turns this DHCP server into a DHCP relay agent. See RFC 1542[36]. The address is the
	 *
	 * address of DHCP server or another relay agent to forward DHCP messages to and from.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RelayTarget=
	 */
	RelayTarget: MaybeArray<string>;
	/**
	 * Specifies value for Agent Circuit ID suboption of Relay Agent Information option. Takes a string, which must be in the format "string:value", where "value" should
	 *
	 * be replaced with the value of the suboption. Defaults to unset (means no Agent Circuit ID suboption is generated). Ignored if RelayTarget= is not specified.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RelayAgentCircuitId=
	 */
	RelayAgentCircuitId: MaybeArray<string>;
	/**
	 * Specifies value for Agent Remote ID suboption of Relay Agent Information option. Takes a string, which must be in the format "string:value", where "value" should be
	 *
	 * replaced with the value of the suboption. Defaults to unset (means no Agent Remote ID suboption is generated). Ignored if RelayTarget= is not specified.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RelayAgentRemoteId=
	 */
	RelayAgentRemoteId: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the server supports RFC 4039[37]. When a client sends a DHCPDISCOVER message with the Rapid Commit option to the server, then the server
	 *
	 * will reply with a DHCPACK message to the client, instead of DHCPOFFER. Defaults to true.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RapidCommit=
	 */
	RapidCommit: MaybeArray<string>;
}
/**
 * The "[DHCPServerStaticLease]" section configures a static DHCP lease to assign a fixed IPv4 address to a specific device based on its MAC address. This section can be
 *
 * specified multiple times.
 *
 */
export interface INetworkDhcpserverstaticleaseOptions {
	/**
	 * The hardware address of a device to match. This key is mandatory.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
	/**
	 * The IPv4 address that should be assigned to the device that was matched with MACAddress=. This key is mandatory.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address=
	 */
	Address: MaybeArray<string>;
}
/**
 * The [IPv6SendRA] section contains settings for sending IPv6 Router Advertisements and whether to act as a router, if enabled via the IPv6SendRA= option described above.
 *
 * IPv6 network prefixes or routes are defined with one or more [IPv6Prefix] or [IPv6RoutePrefix] sections.
 *
 */
export interface INetworkIpv6sendraOptions {
	/**
	 * Takes a boolean. Controls whether a DHCPv6 server is used to acquire IPv6 addresses on the network link when Managed= is set to "true" or if only additional network
	 *
	 * information can be obtained via DHCPv6 for the network link when OtherInformation= is set to "true". Both settings default to "false", which means that a DHCPv6
	 *
	 * server is not being used.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Managed=
	 */
	Managed: MaybeArray<string>;
	/**
	 * Takes a boolean. Controls whether a DHCPv6 server is used to acquire IPv6 addresses on the network link when Managed= is set to "true" or if only additional network
	 *
	 * information can be obtained via DHCPv6 for the network link when OtherInformation= is set to "true". Both settings default to "false", which means that a DHCPv6
	 *
	 * server is not being used.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Managed=
	 */
	OtherInformation: MaybeArray<string>;
	/**
	 * Takes a timespan. Configures the IPv6 router lifetime in seconds. The value must be 0 seconds, or between 4 seconds and 9000 seconds. When set to 0, the host is not
	 *
	 * acting as a router. Defaults to 1800 seconds (30 minutes).
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterLifetimeSec=
	 */
	RouterLifetimeSec: MaybeArray<string>;
	/**
	 * Takes a timespan. Configures the retransmit time, used by clients to retransmit Neighbor Solicitation messages on address resolution and the Neighbor Unreachability
	 *
	 * Detection algorithm. An integer, the default unit is seconds, in the range 0...4294967295 msec. Defaults to 0.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RetransmitSec=
	 */
	RetransmitSec: MaybeArray<string>;
	/**
	 * Configures IPv6 router preference if RouterLifetimeSec= is non-zero. Valid values are "high", "medium" and "low", with "normal" and "default" added as synonyms for
	 *
	 * "medium" just to make configuration easier. See RFC 4191[21] for details. Defaults to "medium".
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterPreference=
	 */
	RouterPreference: MaybeArray<string>;
	/**
	 * Configures hop limit. Takes an integer in the range 0...255. See also IPv6HopLimit=.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HopLimit=
	 */
	HopLimit: MaybeArray<string>;
	/**
	 * Specifies the name or the index of the uplink interface, or one of the special values ":none" and ":auto". When emitting DNS servers or search domains is enabled
	 *
	 * but no servers are specified, the servers configured in the uplink interface will be emitted. When ":auto", the value specified to the same setting in the
	 *
	 * [DHCPPrefixDelegation] section will be used if DHCPPrefixDelegation= is enabled, otherwise the link which has a default gateway with the highest priority will be
	 *
	 * automatically selected. When ":none", no uplink interface will be selected. Defaults to ":auto".
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UplinkInterface=
	 */
	UplinkInterface: MaybeArray<string>;
	/**
	 * DNS= specifies a list of recursive DNS server IPv6 addresses that are distributed via Router Advertisement messages when EmitDNS= is true.  DNS= also takes special
	 *
	 * value "_link_local"; in that case the IPv6 link-local address is distributed. If DNS= is empty, DNS servers are read from the [Network] section. If the [Network]
	 *
	 * section does not contain any DNS servers either, DNS servers from the uplink interface specified in UplinkInterface= will be used. When EmitDNS= is false, no DNS
	 *
	 * server information is sent in Router Advertisement messages.  EmitDNS= defaults to true.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS=
	 */
	EmitDNS: MaybeArray<string>;
	/**
	 * DNS= specifies a list of recursive DNS server IPv6 addresses that are distributed via Router Advertisement messages when EmitDNS= is true.  DNS= also takes special
	 *
	 * value "_link_local"; in that case the IPv6 link-local address is distributed. If DNS= is empty, DNS servers are read from the [Network] section. If the [Network]
	 *
	 * section does not contain any DNS servers either, DNS servers from the uplink interface specified in UplinkInterface= will be used. When EmitDNS= is false, no DNS
	 *
	 * server information is sent in Router Advertisement messages.  EmitDNS= defaults to true.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS=
	 */
	DNS: MaybeArray<string>;
	/**
	 * A list of DNS search domains distributed via Router Advertisement messages when EmitDomains= is true. If Domains= is empty, DNS search domains are read from the
	 *
	 * [Network] section. If the [Network] section does not contain any DNS search domains either, DNS search domains from the uplink interface specified in
	 *
	 * UplinkInterface= will be used. When EmitDomains= is false, no DNS search domain information is sent in Router Advertisement messages.  EmitDomains= defaults to
	 *
	 * true.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDomains=
	 */
	EmitDomains: MaybeArray<string>;
	/**
	 * A list of DNS search domains distributed via Router Advertisement messages when EmitDomains= is true. If Domains= is empty, DNS search domains are read from the
	 *
	 * [Network] section. If the [Network] section does not contain any DNS search domains either, DNS search domains from the uplink interface specified in
	 *
	 * UplinkInterface= will be used. When EmitDomains= is false, no DNS search domain information is sent in Router Advertisement messages.  EmitDomains= defaults to
	 *
	 * true.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDomains=
	 */
	Domains: MaybeArray<string>;
	/**
	 * Lifetime in seconds for the DNS server addresses listed in DNS= and search domains listed in Domains=. Defaults to 3600 seconds (one hour).
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSLifetimeSec=
	 */
	DNSLifetimeSec: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies that IPv6 router advertisements which indicate to hosts that the router acts as a Home Agent and includes a Home Agent option. Defaults
	 *
	 * to false. See RFC 6275[10] for further details.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HomeAgent=
	 */
	HomeAgent: MaybeArray<string>;
	/**
	 * Takes a timespan. Specifies the lifetime of the Home Agent. An integer, the default unit is seconds, in the range 1...65535. Defaults to the value set to
	 *
	 * RouterLifetimeSec=.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HomeAgentLifetimeSec=
	 */
	HomeAgentLifetimeSec: MaybeArray<string>;
	/**
	 * Configures IPv6 Home Agent preference. Takes an integer in the range 0...65535. Defaults to 0.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HomeAgentPreference=
	 */
	HomeAgentPreference: MaybeArray<string>;
}
/**
 * One or more [IPv6Prefix] sections contain the IPv6 prefixes that are announced via Router Advertisements. See RFC 4861[38] for further details.
 *
 */
export interface INetworkIpv6prefixOptions {
	/**
	 * Takes a boolean to specify whether IPv6 addresses can be autoconfigured with this prefix and whether the prefix can be used for onlink determination. Both settings
	 *
	 * default to "true" in order to ease configuration.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AddressAutoconfiguration=
	 */
	AddressAutoconfiguration: MaybeArray<string>;
	/**
	 * Takes a boolean to specify whether IPv6 addresses can be autoconfigured with this prefix and whether the prefix can be used for onlink determination. Both settings
	 *
	 * default to "true" in order to ease configuration.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AddressAutoconfiguration=
	 */
	OnLink: MaybeArray<string>;
	/**
	 * The IPv6 prefix that is to be distributed to hosts. Similarly to configuring static IPv6 addresses, the setting is configured as an IPv6 prefix and its prefix
	 *
	 * length, separated by a "/" character. Use multiple [IPv6Prefix] sections to configure multiple IPv6 prefixes since prefix lifetimes, address autoconfiguration and
	 *
	 * onlink status may differ from one prefix to another.
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Prefix=
	 */
	Prefix: MaybeArray<string>;
	/**
	 * Preferred and valid lifetimes for the prefix measured in seconds.  PreferredLifetimeSec= defaults to 1800 seconds (30 minutes) and ValidLifetimeSec= defaults to
	 *
	 * 3600 seconds (one hour).
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredLifetimeSec=
	 */
	PreferredLifetimeSec: MaybeArray<string>;
	/**
	 * Preferred and valid lifetimes for the prefix measured in seconds.  PreferredLifetimeSec= defaults to 1800 seconds (30 minutes) and ValidLifetimeSec= defaults to
	 *
	 * 3600 seconds (one hour).
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredLifetimeSec=
	 */
	ValidLifetimeSec: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, adds an address from the prefix. Default to false.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Assign=
	 */
	Assign: MaybeArray<string>;
	/**
	 * Specifies an optional address generation mode for assigning an address in each prefix. This accepts the same syntax as Token= in the [IPv6AcceptRA] section. If
	 *
	 * Assign= is set to false, then this setting will be ignored. Defaults to unset, which means the EUI-64 algorithm will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Token=
	 */
	Token: MaybeArray<string>;
	/**
	 * The metric of the prefix route. Takes an unsigned integer in the range 0...4294967295. When unset or set to 0, the kernel's default value is used. This setting is
	 *
	 * ignored when Assign= is false.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric=
	 */
	RouteMetric: MaybeArray<string>;
}
/**
 * One or more [IPv6RoutePrefix] sections contain the IPv6 prefix routes that are announced via Router Advertisements. See RFC 4191[21] for further details.
 *
 */
export interface INetworkIpv6routeprefixOptions {
	/**
	 * The IPv6 route that is to be distributed to hosts. Similarly to configuring static IPv6 routes, the setting is configured as an IPv6 prefix routes and its prefix
	 *
	 * route length, separated by a "/" character. Use multiple [IPv6RoutePrefix] sections to configure multiple IPv6 prefix routes.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Route=
	 */
	Route: MaybeArray<string>;
	/**
	 * Lifetime for the route prefix measured in seconds.  LifetimeSec= defaults to 3600 seconds (one hour).
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LifetimeSec=
	 */
	LifetimeSec: MaybeArray<string>;
}
/**
 * One or more [IPv6PREF64Prefix] sections contain the IPv6 PREF64 (or NAT64) prefixes that are announced via Router Advertisements. See RFC 8781[33] for further details.
 *
 */
export interface INetworkIpv6pref64prefixOptions {
	/**
	 * The IPv6 PREF64 (or NAT64) prefix that is to be distributed to hosts. The setting holds an IPv6 prefix that should be set up for NAT64 translation (PLAT) to allow
	 *
	 * 464XLAT on the network segment. Use multiple [IPv6PREF64Prefix] sections to configure multiple IPv6 prefixes since prefix lifetime may differ from one prefix to
	 *
	 * another. The prefix is an address with a prefix length, separated by a slash "/" character. Valid NAT64 prefix length are 96, 64, 56, 48, 40, and 32 bits.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Prefix=
	 */
	Prefix: MaybeArray<string>;
	/**
	 * Lifetime for the prefix measured in seconds. Should be greater than or equal to RouterLifetimeSec=.  LifetimeSec= defaults to 1800 seconds.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LifetimeSec=
	 */
	LifetimeSec: MaybeArray<string>;
}
/**
 * The [Bridge] section accepts the following keys:
 *
 */
export interface INetworkBridgeOptions {
	/**
	 * Takes a boolean. Controls whether the bridge should flood traffic for which an FDB entry is missing and the destination is unknown through this port. When unset,
	 *
	 * the kernel's default will be used.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UnicastFlood=
	 */
	UnicastFlood: MaybeArray<string>;
	/**
	 * Takes a boolean. Controls whether the bridge should flood traffic for which an MDB entry is missing and the destination is unknown through this port. When unset,
	 *
	 * the kernel's default will be used.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastFlood=
	 */
	MulticastFlood: MaybeArray<string>;
	/**
	 * Takes a boolean. Multicast to unicast works on top of the multicast snooping feature of the bridge. Which means unicast copies are only delivered to hosts which are
	 *
	 * interested in it. When unset, the kernel's default will be used.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastToUnicast=
	 */
	MulticastToUnicast: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether ARP and ND neighbor suppression is enabled for this port. When unset, the kernel's default will be used.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NeighborSuppression=
	 */
	NeighborSuppression: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether MAC address learning is enabled for this port. When unset, the kernel's default will be used.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Learning=
	 */
	Learning: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether traffic may be sent back out of the port on which it was received. When this flag is false, then the bridge will not forward
	 *
	 * traffic back out of the receiving port. When unset, the kernel's default will be used.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HairPin=
	 */
	HairPin: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether this port is isolated or not. Within a bridge, isolated ports can only communicate with non-isolated ports. When set to true,
	 *
	 * this port can only communicate with other ports whose Isolated setting is false. When set to false, this port can communicate with any other ports. When unset, the
	 *
	 * kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Isolated=
	 */
	Isolated: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether STP Bridge Protocol Data Units will be processed by the bridge port. When unset, the kernel's default will be used.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseBPDU=
	 */
	UseBPDU: MaybeArray<string>;
	/**
	 * Takes a boolean. This flag allows the bridge to immediately stop multicast traffic on a port that receives an IGMP Leave message. It is only used with IGMP snooping
	 *
	 * if enabled on the bridge. When unset, the kernel's default will be used.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FastLeave=
	 */
	FastLeave: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether a given port is allowed to become a root port. Only used when STP is enabled on the bridge. When unset, the kernel's default
	 *
	 * will be used.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AllowPortToBeRoot=
	 */
	AllowPortToBeRoot: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether proxy ARP to be enabled on this port. When unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ProxyARP=
	 */
	ProxyARP: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether proxy ARP to be enabled on this port which meets extended requirements by IEEE 802.11 and Hotspot 2.0 specifications. When
	 *
	 * unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ProxyARPWiFi=
	 */
	ProxyARPWiFi: MaybeArray<string>;
	/**
	 * Configures this port for having multicast routers attached. A port with a multicast router will receive all multicast traffic. Takes one of "no" to disable
	 *
	 * multicast routers on this port, "query" to let the system detect the presence of routers, "permanent" to permanently enable multicast traffic forwarding on this
	 *
	 * port, or "temporary" to enable multicast routers temporarily on this port, not depending on incoming queries. When unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastRouter=
	 */
	MulticastRouter: "no" | "to" | "disable" | "multicast" | "routers" | "on" | "this" | "port" | "query" | "to" | "let" | "the" | "system" | "detect" | "the" | "presence" | "of" | "routers" | "permanent" | "to" | "permanently" | "enable" | "multicast" | "traffic" | "forwarding" | "on" | "this" | "port" | "temporary" | "to" | "enable" | "multicast" | "routers" | "temporarily" | "on" | "this" | "port" | "not" | "depending" | "on" | "incoming" | "queries" | string;
	/**
	 * Sets the "cost" of sending packets of this interface. Each port in a bridge may have a different speed and the cost is used to decide which link to use. Faster
	 *
	 * interfaces should have lower costs. It is an integer value between 1 and 65535.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Cost=
	 */
	Cost: MaybeArray<string>;
	/**
	 * Sets the "priority" of sending packets on this interface. Each port in a bridge may have a different priority which is used to decide which link to use. Lower value
	 *
	 * means higher priority. It is an integer value between 0 to 63. Networkd does not set any default, meaning the kernel default value of 32 is used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Priority=
	 */
	Priority: MaybeArray<string>;
}
/**
 * The [BridgeFDB] section manages the forwarding database table of a port and accepts the following keys. Specify several [BridgeFDB] sections to configure several static
 *
 * MAC table entries.
 *
 */
export interface INetworkBridgefdbOptions {
	/**
	 * As in the [Network] section. This key is mandatory.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
	/**
	 * Takes an IP address of the destination VXLAN tunnel endpoint.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Destination=
	 */
	Destination: MaybeArray<string>;
	/**
	 * The VLAN ID for the new static MAC table entry. If omitted, no VLAN ID information is appended to the new static MAC table entry.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANId=
	 */
	VLANId: MaybeArray<string>;
	/**
	 * The VXLAN Network Identifier (or VXLAN Segment ID) to use to connect to the remote VXLAN tunnel endpoint. Takes a number in the range 1...16777215. Defaults to
	 *
	 * unset.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VNI=
	 */
	VNI: MaybeArray<string>;
	/**
	 * Specifies where the address is associated with. Takes one of "use", "self", "master" or "router".  "use" means the address is in use. User space can use this option
	 *
	 * to indicate to the kernel that the fdb entry is in use.  "self" means the address is associated with the port drivers fdb. Usually hardware.  "master" means the
	 *
	 * address is associated with master devices fdb.  "router" means the destination address is associated with a router. Note that it's valid if the referenced device is
	 *
	 * a VXLAN type device and has route shortcircuit enabled. Defaults to "self".
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AssociatedWith=
	 */
	AssociatedWith: "use" | "self" | "master" | "router" | string;
	/**
	 * Specifies the name or index of the outgoing interface for the VXLAN device driver to reach the remote VXLAN tunnel endpoint. Defaults to unset.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OutgoingInterface=
	 */
	OutgoingInterface: MaybeArray<string>;
}
/**
 * The [BridgeMDB] section manages the multicast membership entries forwarding database table of a port and accepts the following keys. Specify several [BridgeMDB]
 *
 * sections to configure several permanent multicast membership entries.
 *
 */
export interface INetworkBridgemdbOptions {
	/**
	 * Specifies the IPv4 or IPv6 multicast group address to add. This setting is mandatory.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastGroupAddress=
	 */
	MulticastGroupAddress: MaybeArray<string>;
	/**
	 * The VLAN ID for the new entry. Valid ranges are 0 (no VLAN) to 4094. Optional, defaults to 0.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANId=
	 */
	VLANId: MaybeArray<string>;
}
/**
 * The [LLDP] section manages the Link Layer Discovery Protocol (LLDP) and accepts the following keys:
 *
 */
export interface INetworkLldpOptions {
	/**
	 * When configured, the specified Manufacturer Usage Descriptions (MUD) URL will be sent in LLDP packets. The syntax and semantics are the same as for MUDURL= in the
	 *
	 * [DHCPv4] section described above.
	 *
	 * The MUD URLs received via LLDP packets are saved and can be read using the sd_lldp_neighbor_get_mud_url() function.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL=
	 */
	MUDURL: MaybeArray<string>;
}
/**
 * The [CAN] section manages the Controller Area Network (CAN bus) and accepts the following keys:
 *
 */
export interface INetworkCanOptions {
	/**
	 * The bitrate of CAN device in bits per second. The usual SI prefixes (K, M) with the base of 1000 can be used here. Takes a number in the range 1...4294967295.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BitRate=
	 */
	BitRate: MaybeArray<string>;
	/**
	 * Optional sample point in percent with one decimal (e.g.  "75%", "87.5%") or permille (e.g.  "875‰"). This will be ignored when BitRate= is unspecified.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SamplePoint=
	 */
	SamplePoint: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width, which allow one to define the CAN bit-timing in a
	 *
	 * hardware independent format as proposed by the Bosch CAN 2.0 Specification.  TimeQuantaNSec= takes a timespan in nanoseconds.  PropagationSegment=,
	 *
	 * PhaseBufferSegment1=, PhaseBufferSegment2=, and SyncJumpWidth= take number of time quantum specified in TimeQuantaNSec= and must be an unsigned integer in the range
	 *
	 * 0...4294967295. These settings except for SyncJumpWidth= will be ignored when BitRate= is specified.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec=
	 */
	TimeQuantaNSec: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width, which allow one to define the CAN bit-timing in a
	 *
	 * hardware independent format as proposed by the Bosch CAN 2.0 Specification.  TimeQuantaNSec= takes a timespan in nanoseconds.  PropagationSegment=,
	 *
	 * PhaseBufferSegment1=, PhaseBufferSegment2=, and SyncJumpWidth= take number of time quantum specified in TimeQuantaNSec= and must be an unsigned integer in the range
	 *
	 * 0...4294967295. These settings except for SyncJumpWidth= will be ignored when BitRate= is specified.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec=
	 */
	PropagationSegment: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width, which allow one to define the CAN bit-timing in a
	 *
	 * hardware independent format as proposed by the Bosch CAN 2.0 Specification.  TimeQuantaNSec= takes a timespan in nanoseconds.  PropagationSegment=,
	 *
	 * PhaseBufferSegment1=, PhaseBufferSegment2=, and SyncJumpWidth= take number of time quantum specified in TimeQuantaNSec= and must be an unsigned integer in the range
	 *
	 * 0...4294967295. These settings except for SyncJumpWidth= will be ignored when BitRate= is specified.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec=
	 */
	PhaseBufferSegment1: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width, which allow one to define the CAN bit-timing in a
	 *
	 * hardware independent format as proposed by the Bosch CAN 2.0 Specification.  TimeQuantaNSec= takes a timespan in nanoseconds.  PropagationSegment=,
	 *
	 * PhaseBufferSegment1=, PhaseBufferSegment2=, and SyncJumpWidth= take number of time quantum specified in TimeQuantaNSec= and must be an unsigned integer in the range
	 *
	 * 0...4294967295. These settings except for SyncJumpWidth= will be ignored when BitRate= is specified.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec=
	 */
	PhaseBufferSegment2: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width, which allow one to define the CAN bit-timing in a
	 *
	 * hardware independent format as proposed by the Bosch CAN 2.0 Specification.  TimeQuantaNSec= takes a timespan in nanoseconds.  PropagationSegment=,
	 *
	 * PhaseBufferSegment1=, PhaseBufferSegment2=, and SyncJumpWidth= take number of time quantum specified in TimeQuantaNSec= and must be an unsigned integer in the range
	 *
	 * 0...4294967295. These settings except for SyncJumpWidth= will be ignored when BitRate= is specified.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec=
	 */
	SyncJumpWidth: MaybeArray<string>;
	/**
	 * The bitrate and sample point for the data phase, if CAN-FD is used. These settings are analogous to the BitRate= and SamplePoint= keys.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataBitRate=
	 */
	DataBitRate: MaybeArray<string>;
	/**
	 * The bitrate and sample point for the data phase, if CAN-FD is used. These settings are analogous to the BitRate= and SamplePoint= keys.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataBitRate=
	 */
	DataSamplePoint: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width for the data phase, if CAN-FD is used. These
	 *
	 * settings are analogous to the TimeQuantaNSec= or related settings.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec=
	 */
	DataTimeQuantaNSec: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width for the data phase, if CAN-FD is used. These
	 *
	 * settings are analogous to the TimeQuantaNSec= or related settings.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec=
	 */
	DataPropagationSegment: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width for the data phase, if CAN-FD is used. These
	 *
	 * settings are analogous to the TimeQuantaNSec= or related settings.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec=
	 */
	DataPhaseBufferSegment1: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width for the data phase, if CAN-FD is used. These
	 *
	 * settings are analogous to the TimeQuantaNSec= or related settings.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec=
	 */
	DataPhaseBufferSegment2: MaybeArray<string>;
	/**
	 * Specifies the time quanta, propagation segment, phase buffer segment 1 and 2, and the synchronization jump width for the data phase, if CAN-FD is used. These
	 *
	 * settings are analogous to the TimeQuantaNSec= or related settings.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec=
	 */
	DataSyncJumpWidth: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", CAN-FD mode is enabled for the interface. Note, that a bitrate and optional sample point should also be set for the CAN-FD data phase
	 *
	 * using the DataBitRate= and DataSamplePoint= keys, or DataTimeQuanta= and related settings.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FDMode=
	 */
	FDMode: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", non-ISO CAN-FD mode is enabled for the interface. When unset, the kernel's default will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FDNonISO=
	 */
	FDNonISO: MaybeArray<string>;
	/**
	 * Automatic restart delay time. If set to a non-zero value, a restart of the CAN controller will be triggered automatically in case of a bus-off condition after the
	 *
	 * specified delay time. Subsecond delays can be specified using decimals (e.g.  "0.1s") or a "ms" or "us" postfix. Using "infinity" or "0" will turn the automatic
	 *
	 * restart off. By default automatic restart is disabled.
	 *
	 * Added in version 239.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RestartSec=
	 */
	RestartSec: MaybeArray<string>;
	/**
	 * Takes a boolean or a termination resistor value in ohm in the range 0...65535. When "yes", the termination resistor is set to 120 ohm. When "no" or "0" is set, the
	 *
	 * termination resistor is disabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Termination=
	 */
	Termination: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", three samples (instead of one) are used to determine the value of a received bit by majority rule. When unset, the kernel's default
	 *
	 * will be used.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TripleSampling=
	 */
	TripleSampling: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", reporting of CAN bus errors is activated (those include single bit, frame format, and bit stuffing errors, unable to send dominant bit,
	 *
	 * unable to send recessive bit, bus overload, active error announcement, error occurred on transmission). When unset, the kernel's default will be used. Note: in case
	 *
	 * of a CAN bus with a single CAN device, sending a CAN frame may result in a huge number of CAN bus errors.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BusErrorReporting=
	 */
	BusErrorReporting: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", listen-only mode is enabled. When the interface is in listen-only mode, the interface neither transmit CAN frames nor send ACK bit.
	 *
	 * Listen-only mode is important to debug CAN networks without interfering with the communication or acknowledge the CAN frame. When unset, the kernel's default will
	 *
	 * be used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ListenOnly=
	 */
	ListenOnly: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", loopback mode is enabled. When the loopback mode is enabled, the interface treats messages transmitted by itself as received messages.
	 *
	 * The loopback mode is important to debug CAN networks. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Loopback=
	 */
	Loopback: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", one-shot mode is enabled. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OneShot=
	 */
	OneShot: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", the interface will ignore missing CAN ACKs. When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PresumeAck=
	 */
	PresumeAck: MaybeArray<string>;
	/**
	 * Takes a boolean. When "yes", the interface will handle the 4bit data length code (DLC). When unset, the kernel's default will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassicDataLengthCode=
	 */
	ClassicDataLengthCode: MaybeArray<string>;
}
/**
 * The [IPoIB] section manages the IP over Infiniband and accepts the following keys:
 *
 */
export interface INetworkIpoibOptions {
	/**
	 * Takes one of the special values "datagram" or "connected". Defaults to unset, and the kernel's default is used.
	 *
	 * When "datagram", the Infiniband unreliable datagram (UD) transport is used, and so the interface MTU is equal to the IB L2 MTU minus the IPoIB encapsulation header
	 *
	 * (4 bytes). For example, in a typical IB fabric with a 2K MTU, the IPoIB MTU will be 2048 - 4 = 2044 bytes.
	 *
	 * When "connected", the Infiniband reliable connected (RC) transport is used. Connected mode takes advantage of the connected nature of the IB transport and allows an
	 *
	 * MTU up to the maximal IP packet size of 64K, which reduces the number of IP packets needed for handling large UDP datagrams, TCP segments, etc and increases the
	 *
	 * performance for large messages.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Mode=
	 */
	Mode: "the" | "special" | "values" | "datagram" | "connected" | string;
	/**
	 * Takes an boolean value. When true, the kernel ignores multicast groups handled by userspace. Defaults to unset, and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IgnoreUserspaceMulticastGroup=
	 */
	IgnoreUserspaceMulticastGroup: MaybeArray<string>;
}
/**
 * The [QDisc] section manages the traffic control queueing discipline (qdisc).
 *
 */
export interface INetworkQdiscOptions {
	/**
	 * Specifies the parent Queueing Discipline (qdisc). Takes one of "clsact" or "ingress". This is mandatory.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "clsact" | "ingress" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
}
/**
 * The [NetworkEmulator] section manages the queueing discipline (qdisc) of the network emulator. It can be used to configure the kernel packet scheduler and simulate
 *
 * packet delay and loss for UDP or TCP applications, or limit the bandwidth usage of a particular service to simulate internet connections.
 *
 */
export interface INetworkNetworkemulatorOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the fixed amount of delay to be added to all packets going out of the interface. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DelaySec=
	 */
	DelaySec: MaybeArray<string>;
	/**
	 * Specifies the chosen delay to be added to the packets outgoing to the network interface. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DelayJitterSec=
	 */
	DelayJitterSec: MaybeArray<string>;
	/**
	 * Specifies the maximum number of packets the qdisc may hold queued at a time. An unsigned integer in the range 0...4294967294. Defaults to 1000.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
	/**
	 * Specifies an independent loss probability to be added to the packets outgoing from the network interface. Takes a percentage value, suffixed with "%". Defaults to
	 *
	 * unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LossRate=
	 */
	LossRate: MaybeArray<string>;
	/**
	 * Specifies that the chosen percent of packets is duplicated before queuing them. Takes a percentage value, suffixed with "%". Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DuplicateRate=
	 */
	DuplicateRate: MaybeArray<string>;
}
/**
 * The [TokenBucketFilter] section manages the queueing discipline (qdisc) of token bucket filter (tbf).
 *
 */
export interface INetworkTokenbucketfilterOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the latency parameter, which specifies the maximum amount of time a packet can sit in the Token Bucket Filter (TBF). Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LatencySec=
	 */
	LatencySec: MaybeArray<string>;
	/**
	 * Takes the number of bytes that can be queued waiting for tokens to become available. When the size is suffixed with K, M, or G, it is parsed as Kilobytes,
	 *
	 * Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LimitBytes=
	 */
	LimitBytes: MaybeArray<string>;
	/**
	 * Specifies the size of the bucket. This is the maximum amount of bytes that tokens can be available for instantaneous transfer. When the size is suffixed with K, M,
	 *
	 * or G, it is parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BurstBytes=
	 */
	BurstBytes: MaybeArray<string>;
	/**
	 * Specifies the device specific bandwidth. When suffixed with K, M, or G, the specified bandwidth is parsed as Kilobits, Megabits, or Gigabits, respectively, to the
	 *
	 * base of 1000. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Rate=
	 */
	Rate: MaybeArray<string>;
	/**
	 * The Minimum Packet Unit (MPU) determines the minimal token usage (specified in bytes) for a packet. When suffixed with K, M, or G, the specified size is parsed as
	 *
	 * Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to zero.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MPUBytes=
	 */
	MPUBytes: MaybeArray<string>;
	/**
	 * Takes the maximum depletion rate of the bucket. When suffixed with K, M, or G, the specified size is parsed as Kilobits, Megabits, or Gigabits, respectively, to the
	 *
	 * base of 1000. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PeakRate=
	 */
	PeakRate: MaybeArray<string>;
	/**
	 * Specifies the size of the peakrate bucket. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the
	 *
	 * base of 1024. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes=
	 */
	MTUBytes: MaybeArray<string>;
}
/**
 * The [PIE] section manages the queueing discipline (qdisc) of Proportional Integral controller-Enhanced (PIE).
 *
 */
export interface INetworkPieOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the queue size in number of packets. When this limit is reached, incoming packets are dropped. An unsigned integer in the range
	 *
	 * 1...4294967294. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
}
/**
 * The "[FlowQueuePIE]" section manages the queueing discipline (qdisc) of Flow Queue Proportional Integral controller-Enhanced (fq_pie).
 *
 */
export interface INetworkFlowqueuepieOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the queue size in number of packets. When this limit is reached, incoming packets are dropped. An unsigned integer ranges 1 to
	 *
	 * 4294967294. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
}
/**
 * The [StochasticFairBlue] section manages the queueing discipline (qdisc) of stochastic fair blue (sfb).
 *
 */
export interface INetworkStochasticfairblueOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the queue size in number of packets. When this limit is reached, incoming packets are dropped. An unsigned integer in the range
	 *
	 * 0...4294967294. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
}
/**
 * The [StochasticFairnessQueueing] section manages the queueing discipline (qdisc) of stochastic fairness queueing (sfq).
 *
 */
export interface INetworkStochasticfairnessqueueingOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the interval in seconds for queue algorithm perturbation. Defaults to unset.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PerturbPeriodSec=
	 */
	PerturbPeriodSec: MaybeArray<string>;
}
/**
 * The [BFIFO] section manages the queueing discipline (qdisc) of Byte limited Packet First In First Out (bfifo).
 *
 */
export interface INetworkBfifoOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit in bytes on the FIFO buffer size. The size limit prevents overflow in case the kernel is unable to dequeue packets as quickly as it
	 *
	 * receives them. When this limit is reached, incoming packets are dropped. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes, or
	 *
	 * Gigabytes, respectively, to the base of 1024. Defaults to unset and kernel default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LimitBytes=
	 */
	LimitBytes: MaybeArray<string>;
}
/**
 * The [PFIFO] section manages the queueing discipline (qdisc) of Packet First In First Out (pfifo).
 *
 */
export interface INetworkPfifoOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the number of packets in the FIFO queue. The size limit prevents overflow in case the kernel is unable to dequeue packets as quickly as
	 *
	 * it receives them. When this limit is reached, incoming packets are dropped. An unsigned integer in the range 0...4294967294. Defaults to unset and kernel's default
	 *
	 * is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
}
/**
 * The [PFIFOHeadDrop] section manages the queueing discipline (qdisc) of Packet First In First Out Head Drop (pfifo_head_drop).
 *
 */
export interface INetworkPfifoheaddropOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * As in [PFIFO] section.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
}
/**
 * The [PFIFOFast] section manages the queueing discipline (qdisc) of Packet First In First Out Fast (pfifo_fast).
 *
 */
export interface INetworkPfifofastOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
}
/**
 * The [CAKE] section manages the queueing discipline (qdisc) of Common Applications Kept Enhanced (CAKE).
 *
 */
export interface INetworkCakeOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the shaper bandwidth. When suffixed with K, M, or G, the specified size is parsed as Kilobits, Megabits, or Gigabits, respectively, to the base of 1000.
	 *
	 * Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Bandwidth=
	 */
	Bandwidth: MaybeArray<string>;
	/**
	 * Takes a boolean value. Enables automatic capacity estimation based on traffic arriving at this qdisc. This is most likely to be useful with cellular links, which
	 *
	 * tend to change quality randomly. If this setting is enabled, the Bandwidth= setting is used as an initial estimate. Defaults to unset, and the kernel's default is
	 *
	 * used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AutoRateIngress=
	 */
	AutoRateIngress: MaybeArray<string>;
	/**
	 * Specifies that bytes to be addeded to the size of each packet. Bytes may be negative. Takes an integer in the range -64...256. Defaults to unset and kernel's
	 *
	 * default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OverheadBytes=
	 */
	OverheadBytes: MaybeArray<string>;
	/**
	 * Rounds each packet (including overhead) up to the specified bytes. Takes an integer in the range 1...256. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MPUBytes=
	 */
	MPUBytes: MaybeArray<string>;
	/**
	 * Takes one of "none", "atm", or "ptm". Specifies the compensation mode for overhead calculation. When "none", no compensation is taken into account. When "atm",
	 *
	 * enables the compensation for ATM cell framing, which is normally found on ADSL links. When "ptm", enables the compensation for PTM encoding, which is normally found
	 *
	 * on VDSL2 links and uses a 64b/65b encoding scheme. Defaults to unset and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CompensationMode=
	 */
	CompensationMode: "none" | "atm" | "ptm" | string;
	/**
	 * Takes a boolean value. When true, the packet size reported by the Linux kernel will be used, instead of the underlying IP packet size. Defaults to unset, and the
	 *
	 * kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseRawPacketSize=
	 */
	UseRawPacketSize: MaybeArray<string>;
	/**
	 * CAKE places packets from different flows into different queues, then packets from each queue are delivered fairly. This specifies whether the fairness is based on
	 *
	 * source address, destination address, individual flows, or any combination of those. The available values are:
	 *
	 * none
	 *
	 * The flow isolation is disabled, and all traffic passes through a single queue.
	 *
	 * Added in version 250.
	 *
	 * src-host
	 *
	 * Flows are defined only by source address. Equivalent to the "srchost" option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * dst-host
	 *
	 * Flows are defined only by destination address. Equivalent to the "dsthost" option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * hosts
	 *
	 * Flows are defined by source-destination host pairs. Equivalent to the same option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * flows
	 *
	 * Flows are defined by the entire 5-tuple of source address, destination address, transport protocol, source port and destination port. Equivalent to the same
	 *
	 * option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * dual-src-host
	 *
	 * Flows are defined by the 5-tuple (see "flows" in the above), and fairness is applied first over source addresses, then over individual flows. Equivalent to the
	 *
	 * "dual-srchost" option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * dual-dst-host
	 *
	 * Flows are defined by the 5-tuple (see "flows" in the above), and fairness is applied first over destination addresses, then over individual flows. Equivalent to
	 *
	 * the "dual-dsthost" option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * triple
	 *
	 * Flows are defined by the 5-tuple (see "flows"), and fairness is applied over source and destination addresses, and also over individual flows. Equivalent to the
	 *
	 * "triple-isolate" option for tc qdisc command. See also tc-cake(8).
	 *
	 * Added in version 250.
	 *
	 * Defaults to unset and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FlowIsolationMode=
	 */
	FlowIsolationMode: MaybeArray<string>;
	/**
	 * Takes a boolean value. When true, CAKE performs a NAT lookup before applying flow-isolation rules, to determine the true addresses and port numbers of the packet,
	 *
	 * to improve fairness between hosts inside the NAT. This has no practical effect when FlowIsolationMode= is "none" or "flows", or if NAT is performed on a different
	 *
	 * host. Defaults to unset, and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NAT=
	 */
	NAT: MaybeArray<string>;
	/**
	 * CAKE divides traffic into "tins", and each tin has its own independent set of flow-isolation queues, bandwidth threshold, and priority. This specifies the preset of
	 *
	 * tin profiles. The available values are:
	 *
	 * besteffort
	 *
	 * Disables priority queueing by placing all traffic in one tin.
	 *
	 * Added in version 250.
	 *
	 * precedence
	 *
	 * Enables priority queueing based on the legacy interpretation of TOS "Precedence" field. Use of this preset on the modern Internet is firmly discouraged.
	 *
	 * Added in version 250.
	 *
	 * diffserv8
	 *
	 * Enables priority queueing based on the Differentiated Service ("DiffServ") field with eight tins: Background Traffic, High Throughput, Best Effort, Video
	 *
	 * Streaming, Low Latency Transactions, Interactive Shell, Minimum Latency, and Network Control.
	 *
	 * Added in version 250.
	 *
	 * diffserv4
	 *
	 * Enables priority queueing based on the Differentiated Service ("DiffServ") field with four tins: Background Traffic, Best Effort, Streaming Media, and Latency
	 *
	 * Sensitive.
	 *
	 * Added in version 250.
	 *
	 * diffserv3
	 *
	 * Enables priority queueing based on the Differentiated Service ("DiffServ") field with three tins: Background Traffic, Best Effort, and Latency Sensitive.
	 *
	 * Added in version 250.
	 *
	 * Defaults to unset, and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PriorityQueueingPreset=
	 */
	PriorityQueueingPreset: MaybeArray<string>;
	/**
	 * Takes an integer in the range 1...4294967295. When specified, firewall-mark-based overriding of CAKE's tin selection is enabled. Defaults to unset, and the kernel's
	 *
	 * default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FirewallMark=
	 */
	FirewallMark: MaybeArray<string>;
	/**
	 * Takes a boolean value. When true, CAKE clears the DSCP fields, except for ECN bits, of any packet passing through CAKE. Defaults to unset, and the kernel's default
	 *
	 * is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Wash=
	 */
	Wash: MaybeArray<string>;
	/**
	 * Takes a boolean value. When true, CAKE will split General Segmentation Offload (GSO) super-packets into their on-the-wire components and dequeue them individually.
	 *
	 * Defaults to unset, and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SplitGSO=
	 */
	SplitGSO: MaybeArray<string>;
	/**
	 * Specifies the RTT for the filter. Takes a timespan. Typical values are e.g. 100us for extremely high-performance 10GigE+ networks like datacentre, 1ms for non-WiFi
	 *
	 * LAN connections, 100ms for typical internet connections. Defaults to unset, and the kernel's default will be used.
	 *
	 * Added in version 253.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RTTSec=
	 */
	RTTSec: MaybeArray<string>;
	/**
	 * Takes a boolean value, or special value "aggressive". If enabled, ACKs in each flow are queued and redundant ACKs to the upstream are dropped. If yes, the filter
	 *
	 * will always keep at least two redundant ACKs in the queue, while in "aggressive" mode, it will filter down to a single ACK. This may improve download throughput on
	 *
	 * links with very asymmetrical rate limits. Defaults to unset, and the kernel's default will be used.
	 *
	 * Added in version 253.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AckFilter=
	 */
	AckFilter: MaybeArray<string>;
}
/**
 * The [ControlledDelay] section manages the queueing discipline (qdisc) of controlled delay (CoDel).
 *
 */
export interface INetworkControlleddelayOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the queue size in number of packets. When this limit is reached, incoming packets are dropped. An unsigned integer in the range
	 *
	 * 0...4294967294. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
	/**
	 * Takes a timespan. Specifies the acceptable minimum standing/persistent queue delay. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TargetSec=
	 */
	TargetSec: MaybeArray<string>;
	/**
	 * Takes a timespan. This is used to ensure that the measured minimum delay does not become too stale. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IntervalSec=
	 */
	IntervalSec: MaybeArray<string>;
	/**
	 * Takes a boolean. This can be used to mark packets instead of dropping them. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ECN=
	 */
	ECN: MaybeArray<string>;
	/**
	 * Takes a timespan. This sets a threshold above which all packets are marked with ECN Congestion Experienced (CE). Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CEThresholdSec=
	 */
	CEThresholdSec: MaybeArray<string>;
}
/**
 * The [DeficitRoundRobinScheduler] section manages the queueing discipline (qdisc) of Deficit Round Robin Scheduler (DRR).
 *
 */
export interface INetworkDeficitroundrobinschedulerOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
}
/**
 * The [DeficitRoundRobinSchedulerClass] section manages the traffic control class of Deficit Round Robin Scheduler (DRR).
 *
 */
export interface INetworkDeficitroundrobinschedulerclassOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", or a qdisc identifier. The qdisc identifier is specified as the major and minor numbers in
	 *
	 * hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "a" | "qdisc" | "identifier" | string;
	/**
	 * Configures the unique identifier of the class. It is specified as the major and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon
	 *
	 * ("major:minor"). Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassId=
	 */
	ClassId: MaybeArray<string>;
	/**
	 * Specifies the amount of bytes a flow is allowed to dequeue before the scheduler moves to the next class. When suffixed with K, M, or G, the specified size is parsed
	 *
	 * as Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to the MTU of the interface.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes=
	 */
	QuantumBytes: MaybeArray<string>;
}
/**
 * The [EnhancedTransmissionSelection] section manages the queueing discipline (qdisc) of Enhanced Transmission Selection (ETS).
 *
 */
export interface INetworkEnhancedtransmissionselectionOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the number of bands. An unsigned integer in the range 1...16. This value has to be at least large enough to cover the strict bands specified through the
	 *
	 * StrictBands= and bandwidth-sharing bands specified in QuantumBytes=.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Bands=
	 */
	Bands: MaybeArray<string>;
	/**
	 * Specifies the number of bands that should be created in strict mode. An unsigned integer in the range 1...16.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#StrictBands=
	 */
	StrictBands: MaybeArray<string>;
	/**
	 * Specifies the white-space separated list of quantum used in band-sharing bands. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes,
	 *
	 * or Gigabytes, respectively, to the base of 1024. This setting can be specified multiple times. If an empty string is assigned, then the all previous assignments are
	 *
	 * cleared.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes=
	 */
	QuantumBytes: MaybeArray<string>;
	/**
	 * The priority map maps the priority of a packet to a band. The argument is a whitespace separated list of numbers. The first number indicates which band the packets
	 *
	 * with priority 0 should be put to, the second is for priority 1, and so on. There can be up to 16 numbers in the list. If there are fewer, the default band that
	 *
	 * traffic with one of the unmentioned priorities goes to is the last one. Each band number must be in the range 0...255. This setting can be specified multiple times.
	 *
	 * If an empty string is assigned, then the all previous assignments are cleared.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PriorityMap=
	 */
	PriorityMap: MaybeArray<string>;
}
/**
 * The [GenericRandomEarlyDetection] section manages the queueing discipline (qdisc) of Generic Random Early Detection (GRED).
 *
 */
export interface INetworkGenericrandomearlydetectionOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the number of virtual queues. Takes an integer in the range 1...16. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VirtualQueues=
	 */
	VirtualQueues: MaybeArray<string>;
	/**
	 * Specifies the number of default virtual queue. This must be less than VirtualQueue=. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultVirtualQueue=
	 */
	DefaultVirtualQueue: MaybeArray<string>;
	/**
	 * Takes a boolean. It turns on the RIO-like buffering scheme. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#GenericRIO=
	 */
	GenericRIO: MaybeArray<string>;
}
/**
 * The [FairQueueingControlledDelay] section manages the queueing discipline (qdisc) of fair queuing controlled delay (FQ-CoDel).
 *
 */
export interface INetworkFairqueueingcontrolleddelayOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the real queue size. When this limit is reached, incoming packets are dropped. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
	/**
	 * Specifies the limit on the total number of bytes that can be queued in this FQ-CoDel instance. When suffixed with K, M, or G, the specified size is parsed as
	 *
	 * Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MemoryLimitBytes=
	 */
	MemoryLimitBytes: MaybeArray<string>;
	/**
	 * Specifies the number of flows into which the incoming packets are classified. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Flows=
	 */
	Flows: MaybeArray<string>;
	/**
	 * Takes a timespan. Specifies the acceptable minimum standing/persistent queue delay. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TargetSec=
	 */
	TargetSec: MaybeArray<string>;
	/**
	 * Takes a timespan. This is used to ensure that the measured minimum delay does not become too stale. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IntervalSec=
	 */
	IntervalSec: MaybeArray<string>;
	/**
	 * Specifies the number of bytes used as the "deficit" in the fair queuing algorithm timespan. When suffixed with K, M, or G, the specified size is parsed as
	 *
	 * Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes=
	 */
	QuantumBytes: MaybeArray<string>;
	/**
	 * Takes a boolean. This can be used to mark packets instead of dropping them. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ECN=
	 */
	ECN: MaybeArray<string>;
	/**
	 * Takes a timespan. This sets a threshold above which all packets are marked with ECN Congestion Experienced (CE). Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CEThresholdSec=
	 */
	CEThresholdSec: MaybeArray<string>;
}
/**
 * The [FairQueueing] section manages the queueing discipline (qdisc) of fair queue traffic policing (FQ).
 *
 */
export interface INetworkFairqueueingOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the real queue size. When this limit is reached, incoming packets are dropped. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the maximum number of packets queued per flow. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FlowLimit=
	 */
	FlowLimit: MaybeArray<string>;
	/**
	 * Specifies the credit per dequeue RR round, i.e. the amount of bytes a flow is allowed to dequeue at once. When suffixed with K, M, or G, the specified size is
	 *
	 * parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes=
	 */
	QuantumBytes: MaybeArray<string>;
	/**
	 * Specifies the initial sending rate credit, i.e. the amount of bytes a new flow is allowed to dequeue initially. When suffixed with K, M, or G, the specified size is
	 *
	 * parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialQuantumBytes=
	 */
	InitialQuantumBytes: MaybeArray<string>;
	/**
	 * Specifies the maximum sending rate of a flow. When suffixed with K, M, or G, the specified size is parsed as Kilobits, Megabits, or Gigabits, respectively, to the
	 *
	 * base of 1000. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MaximumRate=
	 */
	MaximumRate: MaybeArray<string>;
	/**
	 * Specifies the size of the hash table used for flow lookups. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Buckets=
	 */
	Buckets: MaybeArray<string>;
	/**
	 * Takes an unsigned integer. For packets not owned by a socket, fq is able to mask a part of hash and reduce number of buckets associated with the traffic. Defaults
	 *
	 * to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OrphanMask=
	 */
	OrphanMask: MaybeArray<string>;
	/**
	 * Takes a boolean, and enables or disables flow pacing. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Pacing=
	 */
	Pacing: MaybeArray<string>;
	/**
	 * Takes a timespan. This sets a threshold above which all packets are marked with ECN Congestion Experienced (CE). Defaults to unset and kernel's default is used.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CEThresholdSec=
	 */
	CEThresholdSec: MaybeArray<string>;
}
/**
 * The [TrivialLinkEqualizer] section manages the queueing discipline (qdisc) of trivial link equalizer (teql).
 *
 */
export interface INetworkTriviallinkequalizerOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the interface ID "N" of teql. Defaults to "0". Note that when teql is used, currently, the module sch_teql with max_equalizers=N+1 option must be loaded
	 *
	 * before systemd-networkd is started.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Id=
	 */
	Id: MaybeArray<string>;
}
/**
 * The [HierarchyTokenBucket] section manages the queueing discipline (qdisc) of hierarchy token bucket (htb).
 *
 */
export interface INetworkHierarchytokenbucketOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Takes the minor id in hexadecimal of the default class. Unclassified traffic gets sent to the class. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultClass=
	 */
	DefaultClass: MaybeArray<string>;
	/**
	 * Takes an unsigned integer. The DRR quantums are calculated by dividing the value configured in Rate= by RateToQuantum=.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RateToQuantum=
	 */
	RateToQuantum: MaybeArray<string>;
}
/**
 * The [HierarchyTokenBucketClass] section manages the traffic control class of hierarchy token bucket (htb).
 *
 */
export interface INetworkHierarchytokenbucketclassOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", or a qdisc identifier. The qdisc identifier is specified as the major and minor numbers in
	 *
	 * hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "a" | "qdisc" | "identifier" | string;
	/**
	 * Configures the unique identifier of the class. It is specified as the major and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon
	 *
	 * ("major:minor"). Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassId=
	 */
	ClassId: MaybeArray<string>;
	/**
	 * Specifies the priority of the class. In the round-robin process, classes with the lowest priority field are tried for packets first.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Priority=
	 */
	Priority: MaybeArray<string>;
	/**
	 * Specifies how many bytes to serve from leaf at once. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes, or Gigabytes,
	 *
	 * respectively, to the base of 1024.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes=
	 */
	QuantumBytes: MaybeArray<string>;
	/**
	 * Specifies the maximum packet size we create. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes, or Gigabytes, respectively, to the
	 *
	 * base of 1024.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes=
	 */
	MTUBytes: MaybeArray<string>;
	/**
	 * Takes an unsigned integer which specifies per-packet size overhead used in rate computations. When suffixed with K, M, or G, the specified size is parsed as
	 *
	 * Kilobytes, Megabytes, or Gigabytes, respectively, to the base of 1024.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OverheadBytes=
	 */
	OverheadBytes: MaybeArray<string>;
	/**
	 * Specifies the maximum rate this class and all its children are guaranteed. When suffixed with K, M, or G, the specified size is parsed as Kilobits, Megabits, or
	 *
	 * Gigabits, respectively, to the base of 1000. This setting is mandatory.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Rate=
	 */
	Rate: MaybeArray<string>;
	/**
	 * Specifies the maximum rate at which a class can send, if its parent has bandwidth to spare. When suffixed with K, M, or G, the specified size is parsed as Kilobits,
	 *
	 * Megabits, or Gigabits, respectively, to the base of 1000. When unset, the value specified with Rate= is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CeilRate=
	 */
	CeilRate: MaybeArray<string>;
	/**
	 * Specifies the maximum bytes burst which can be accumulated during idle period. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes,
	 *
	 * or Gigabytes, respectively, to the base of 1024.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BufferBytes=
	 */
	BufferBytes: MaybeArray<string>;
	/**
	 * Specifies the maximum bytes burst for ceil which can be accumulated during idle period. When suffixed with K, M, or G, the specified size is parsed as Kilobytes,
	 *
	 * Megabytes, or Gigabytes, respectively, to the base of 1024.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CeilBufferBytes=
	 */
	CeilBufferBytes: MaybeArray<string>;
}
/**
 * The [HeavyHitterFilter] section manages the queueing discipline (qdisc) of Heavy Hitter Filter (hhf).
 *
 */
export interface INetworkHeavyhitterfilterOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
	/**
	 * Specifies the hard limit on the queue size in number of packets. When this limit is reached, incoming packets are dropped. An unsigned integer in the range
	 *
	 * 0...4294967294. Defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit=
	 */
	PacketLimit: MaybeArray<string>;
}
/**
 * The [QuickFairQueueing] section manages the queueing discipline (qdisc) of Quick Fair Queueing (QFQ).
 *
 */
export interface INetworkQuickfairqueueingOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", "clsact", "ingress" or a class identifier. The class identifier is specified as the major
	 *
	 * and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "clsact" | "ingress" | "a" | "class" | "identifier" | string;
	/**
	 * Configures the major number of unique identifier of the qdisc, known as the handle. Takes a hexadecimal number in the range 0x1–0xffff. Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle=
	 */
	Handle: MaybeArray<string>;
}
/**
 * The [QuickFairQueueingClass] section manages the traffic control class of Quick Fair Queueing (qfq).
 *
 */
export interface INetworkQuickfairqueueingclassOptions {
	/**
	 * Configures the parent Queueing Discipline (qdisc). Takes one of "root", or a qdisc identifier. The qdisc identifier is specified as the major and minor numbers in
	 *
	 * hexadecimal in the range 0x1–0xffff separated with a colon ("major:minor"). Defaults to "root".
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent=
	 */
	Parent: "root" | "a" | "qdisc" | "identifier" | string;
	/**
	 * Configures the unique identifier of the class. It is specified as the major and minor numbers in hexadecimal in the range 0x1–0xffff separated with a colon
	 *
	 * ("major:minor"). Defaults to unset.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassId=
	 */
	ClassId: MaybeArray<string>;
	/**
	 * Specifies the weight of the class. Takes an integer in the range 1...1023. Defaults to unset in which case the kernel default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Weight=
	 */
	Weight: MaybeArray<string>;
	/**
	 * Specifies the maximum packet size in bytes for the class. When suffixed with K, M, or G, the specified size is parsed as Kilobytes, Megabytes, or Gigabytes,
	 *
	 * respectively, to the base of 1024. When unset, the kernel default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MaxPacketBytes=
	 */
	MaxPacketBytes: MaybeArray<string>;
}
/**
 * The [BridgeVLAN] section manages the VLAN ID configuration of a bridge port and accepts the following keys. Specify several [BridgeVLAN] sections to configure several
 *
 * VLAN entries. The VLANFiltering= option has to be enabled, see the [Bridge] section in systemd.netdev(5).
 *
 */
export interface INetworkBridgevlanOptions {
	/**
	 * The VLAN ID allowed on the port. This can be either a single ID or a range M-N. Takes an integer in the range 1...4094.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLAN=
	 */
	VLAN: MaybeArray<string>;
	/**
	 * The VLAN ID specified here will be used to untag frames on egress. Configuring EgressUntagged= implicates the use of VLAN= above and will enable the VLAN ID for
	 *
	 * ingress as well. This can be either a single ID or a range M-N.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EgressUntagged=
	 */
	EgressUntagged: MaybeArray<string>;
	/**
	 * The Port VLAN ID specified here is assigned to all untagged frames at ingress.  PVID= can be used only once. Configuring PVID= implicates the use of VLAN= above and
	 *
	 * will enable the VLAN ID for ingress as well.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PVID=
	 */
	PVID: MaybeArray<string>;
}
export interface INetworkUnit {
	Match: INetworkMatchOptions;
	Link: INetworkLinkOptions;
	SrIov: INetworkSrIovOptions;
	Network: INetworkOptions;
	Address: INetworkAddressOptions;
	Neighbor: INetworkNeighborOptions;
	Ipv6addresslabel: INetworkIpv6addresslabelOptions;
	Routingpolicyrule: INetworkRoutingpolicyruleOptions;
	Nexthop: INetworkNexthopOptions;
	Route: INetworkRouteOptions;
	Dhcpv4: INetworkDhcpv4Options;
	Dhcpv6: INetworkDhcpv6Options;
	Dhcpprefixdelegation: INetworkDhcpprefixdelegationOptions;
	Ipv6acceptra: INetworkIpv6acceptraOptions;
	Dhcpserver: INetworkDhcpserverOptions;
	Dhcpserverstaticlease: INetworkDhcpserverstaticleaseOptions;
	Ipv6sendra: INetworkIpv6sendraOptions;
	Ipv6prefix: INetworkIpv6prefixOptions;
	Ipv6routeprefix: INetworkIpv6routeprefixOptions;
	Ipv6pref64prefix: INetworkIpv6pref64prefixOptions;
	Bridge: INetworkBridgeOptions;
	Bridgefdb: INetworkBridgefdbOptions;
	Bridgemdb: INetworkBridgemdbOptions;
	Lldp: INetworkLldpOptions;
	Can: INetworkCanOptions;
	Ipoib: INetworkIpoibOptions;
	Qdisc: INetworkQdiscOptions;
	Networkemulator: INetworkNetworkemulatorOptions;
	Tokenbucketfilter: INetworkTokenbucketfilterOptions;
	Pie: INetworkPieOptions;
	Flowqueuepie: INetworkFlowqueuepieOptions;
	Stochasticfairblue: INetworkStochasticfairblueOptions;
	Stochasticfairnessqueueing: INetworkStochasticfairnessqueueingOptions;
	Bfifo: INetworkBfifoOptions;
	Pfifo: INetworkPfifoOptions;
	Pfifoheaddrop: INetworkPfifoheaddropOptions;
	Pfifofast: INetworkPfifofastOptions;
	Cake: INetworkCakeOptions;
	Controlleddelay: INetworkControlleddelayOptions;
	Deficitroundrobinscheduler: INetworkDeficitroundrobinschedulerOptions;
	Deficitroundrobinschedulerclass: INetworkDeficitroundrobinschedulerclassOptions;
	Enhancedtransmissionselection: INetworkEnhancedtransmissionselectionOptions;
	Genericrandomearlydetection: INetworkGenericrandomearlydetectionOptions;
	Fairqueueingcontrolleddelay: INetworkFairqueueingcontrolleddelayOptions;
	Fairqueueing: INetworkFairqueueingOptions;
	Triviallinkequalizer: INetworkTriviallinkequalizerOptions;
	Hierarchytokenbucket: INetworkHierarchytokenbucketOptions;
	Hierarchytokenbucketclass: INetworkHierarchytokenbucketclassOptions;
	Heavyhitterfilter: INetworkHeavyhitterfilterOptions;
	Quickfairqueueing: INetworkQuickfairqueueingOptions;
	Quickfairqueueingclass: INetworkQuickfairqueueingclassOptions;
	Bridgevlan: INetworkBridgevlanOptions;
}
