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
 * A virtual network device is only created if the [Match] section matches the current environment, or if the section is empty. The following keys are accepted:
 *
 */
export interface INetdevMatchOptions {
	/**
	 * Matches against the hostname or machine ID of the host. See ConditionHost= in systemd.unit(5) for details. When prefixed with an exclamation mark ("!"), the result
	 *
	 * is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Host=
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Virtualization=
	 */
	Virtualization: MaybeArray<string>;
	/**
	 * Checks whether a specific kernel command line option is set. See ConditionKernelCommandLine= in systemd.unit(5) for details. When prefixed with an exclamation mark
	 *
	 * ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KernelCommandLine=
	 */
	KernelCommandLine: MaybeArray<string>;
	/**
	 * Checks whether the kernel version (as reported by uname -r) matches a certain expression. See ConditionKernelVersion= in systemd.unit(5) for details. When prefixed
	 *
	 * with an exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KernelVersion=
	 */
	KernelVersion: MaybeArray<string>;
	/**
	 * Checks whether the specified credential was passed to the systemd-udevd.service service. See System and Service Credentials[6] for details. When prefixed with an
	 *
	 * exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Credential=
	 */
	Credential: MaybeArray<string>;
	/**
	 * Checks whether the system is running on a specific architecture. See ConditionArchitecture= in systemd.unit(5) for details. When prefixed with an exclamation mark
	 *
	 * ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Architecture=
	 */
	Architecture: MaybeArray<string>;
	/**
	 * Checks whether the system is running on a machine with the specified firmware. See ConditionFirmware= in systemd.unit(5) for details. When prefixed with an
	 *
	 * exclamation mark ("!"), the result is negated. If an empty string is assigned, the previously assigned value is cleared.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Firmware=
	 */
	Firmware: MaybeArray<string>;
}
/**
 * The [NetDev] section accepts the following keys:
 *
 */
export interface INetdevOptions {
	/**
	 * A free-form description of the netdev.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Description=
	 */
	Description: MaybeArray<string>;
	/**
	 * The interface name used when creating the netdev. This setting is compulsory.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Name=
	 */
	Name: MaybeArray<string>;
	/**
	 * The netdev kind. This setting is compulsory. See the "Supported netdev kinds" section for the valid keys.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Kind=
	 */
	Kind: MaybeArray<string>;
	/**
	 * The maximum transmission unit in bytes to set for the device. The usual suffixes K, M, G are supported and are understood to the base of 1024. For "tun" or "tap"
	 *
	 * devices, MTUBytes= setting is not currently supported in [NetDev] section. Please specify it in [Link] section of corresponding systemd.network(5) files.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MTUBytes=
	 */
	MTUBytes: MaybeArray<string>;
	/**
	 * Specifies the MAC address to use for the device, or takes the special value "none". When "none", systemd-networkd does not request the MAC address for the device,
	 *
	 * and the kernel will assign a random MAC address. For "tun", "tap", or "l2tp" devices, the MACAddress= setting in the [NetDev] section is not supported and will be
	 *
	 * ignored. Please specify it in the [Link] section of the corresponding systemd.network(5) file. If this option is not set, "vlan" device inherits the MAC address of
	 *
	 * the master interface. For other kind of netdevs, if this option is not set, then the MAC address is generated based on the interface name and the machine-id(5).
	 *
	 * Note, even if "none" is specified, systemd-udevd will assign the persistent MAC address for the device, as 99-default.link has MACAddressPolicy=persistent. So, it
	 *
	 * is also necessary to create a custom .link file for the device, if the MAC address assignment is not desired.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
}
/**
 * The [Bridge] section only applies for netdevs of kind "bridge", and accepts the following keys:
 *
 */
export interface INetdevBridgeOptions {
	/**
	 * HelloTimeSec specifies the number of seconds between two hello packets sent out by the root bridge and the designated bridges. Hello packets are used to communicate
	 *
	 * information about the topology throughout the entire bridged local area network.
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#HelloTimeSec=
	 */
	HelloTimeSec: MaybeArray<string>;
	/**
	 * MaxAgeSec specifies the number of seconds of maximum message age. If the last seen (received) hello packet is more than this number of seconds old, the bridge in
	 *
	 * question will start the takeover procedure in attempt to become the Root Bridge itself.
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MaxAgeSec=
	 */
	MaxAgeSec: MaybeArray<string>;
	/**
	 * ForwardDelaySec specifies the number of seconds spent in each of the Listening and Learning states before the Forwarding state is entered.
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ForwardDelaySec=
	 */
	ForwardDelaySec: MaybeArray<string>;
	/**
	 * This specifies the number of seconds a MAC Address will be kept in the forwarding database after having a packet received from this MAC Address.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AgeingTimeSec=
	 */
	AgeingTimeSec: MaybeArray<string>;
	/**
	 * The priority of the bridge. An integer between 0 and 65535. A lower value means higher priority. The bridge having the lowest priority will be elected as root
	 *
	 * bridge.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Priority=
	 */
	Priority: MaybeArray<string>;
	/**
	 * A 16-bit bitmask represented as an integer which allows forwarding of link local frames with 802.1D reserved addresses (01:80:C2:00:00:0X). A logical AND is
	 *
	 * performed between the specified bitmask and the exponentiation of 2^X, the lower nibble of the last octet of the MAC address. For example, a value of 8 would allow
	 *
	 * forwarding of frames addressed to 01:80:C2:00:00:03 (802.1X PAE).
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GroupForwardMask=
	 */
	GroupForwardMask: MaybeArray<string>;
	/**
	 * This specifies the default port VLAN ID of a newly attached bridge port. Set this to an integer in the range 1...4094 or "none" to disable the PVID.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DefaultPVID=
	 */
	DefaultPVID: MaybeArray<string>;
	/**
	 * Takes a boolean. This setting controls the IFLA_BR_MCAST_QUERIER option in the kernel. If enabled, the kernel will send general ICMP queries from a zero source
	 *
	 * address. This feature should allow faster convergence on startup, but it causes some multicast-aware switches to misbehave and disrupt forwarding of multicast
	 *
	 * packets. When unset, the kernel's default will be used.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MulticastQuerier=
	 */
	MulticastQuerier: MaybeArray<string>;
	/**
	 * Takes a boolean. This setting controls the IFLA_BR_MCAST_SNOOPING option in the kernel. If enabled, IGMP snooping monitors the Internet Group Management Protocol
	 *
	 * (IGMP) traffic between hosts and multicast routers. When unset, the kernel's default will be used.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MulticastSnooping=
	 */
	MulticastSnooping: MaybeArray<string>;
	/**
	 * Takes a boolean. This setting controls the IFLA_BR_VLAN_FILTERING option in the kernel. If enabled, the bridge will be started in VLAN-filtering mode. When unset,
	 *
	 * the kernel's default will be used.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VLANFiltering=
	 */
	VLANFiltering: MaybeArray<string>;
	/**
	 * Allows setting the protocol used for VLAN filtering. Takes 802.1q or, 802.1ad, and defaults to unset and kernel's default is used.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VLANProtocol=
	 */
	VLANProtocol: MaybeArray<string>;
	/**
	 * Takes a boolean. This enables the bridge's Spanning Tree Protocol (STP). When unset, the kernel's default will be used.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#STP=
	 */
	STP: MaybeArray<string>;
	/**
	 * Allows changing bridge's multicast Internet Group Management Protocol (IGMP) version. Takes an integer 2 or 3. When unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MulticastIGMPVersion=
	 */
	MulticastIGMPVersion: MaybeArray<string>;
}
/**
 * The [VLAN] section only applies for netdevs of kind "vlan", and accepts the following key:
 *
 */
export interface INetdevVlanOptions {
	/**
	 * The VLAN ID to use. An integer in the range 0...4094. This setting is compulsory.
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Id=
	 */
	Id: MaybeArray<string>;
	/**
	 * Allows setting the protocol used for the VLAN interface. Takes "802.1q" or, "802.1ad", and defaults to unset and kernel's default is used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Protocol=
	 */
	Protocol: MaybeArray<string>;
	/**
	 * Takes a boolean. The Generic VLAN Registration Protocol (GVRP) is a protocol that allows automatic learning of VLANs on a network. When unset, the kernel's default
	 *
	 * will be used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GVRP=
	 */
	GVRP: MaybeArray<string>;
	/**
	 * Takes a boolean. Multiple VLAN Registration Protocol (MVRP) formerly known as GARP VLAN Registration Protocol (GVRP) is a standards-based Layer 2 network protocol,
	 *
	 * for automatic configuration of VLAN information on switches. It was defined in the 802.1ak amendment to 802.1Q-2005. When unset, the kernel's default will be used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MVRP=
	 */
	MVRP: MaybeArray<string>;
	/**
	 * Takes a boolean. The VLAN loose binding mode, in which only the operational state is passed from the parent to the associated VLANs, but the VLAN device state is
	 *
	 * not changed. When unset, the kernel's default will be used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#LooseBinding=
	 */
	LooseBinding: MaybeArray<string>;
	/**
	 * Takes a boolean. When enabled, the VLAN reorder header is used and VLAN interfaces behave like physical interfaces. When unset, the kernel's default will be used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ReorderHeader=
	 */
	ReorderHeader: MaybeArray<string>;
	/**
	 * Defines a mapping of Linux internal packet priority (SO_PRIORITY) to VLAN header PCP field for outgoing and incoming frames, respectively. Takes a
	 *
	 * whitespace-separated list of integer pairs, where each integer must be in the range 1...4294967294, in the format "from"-"to", e.g., "21-7 45-5". Note that "from"
	 *
	 * must be greater than or equal to "to". When unset, the kernel's default will be used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EgressQOSMaps=
	 */
	EgressQOSMaps: MaybeArray<string>;
	/**
	 * Defines a mapping of Linux internal packet priority (SO_PRIORITY) to VLAN header PCP field for outgoing and incoming frames, respectively. Takes a
	 *
	 * whitespace-separated list of integer pairs, where each integer must be in the range 1...4294967294, in the format "from"-"to", e.g., "21-7 45-5". Note that "from"
	 *
	 * must be greater than or equal to "to". When unset, the kernel's default will be used.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EgressQOSMaps=
	 */
	IngressQOSMaps: MaybeArray<string>;
}
/**
 * The [MACVLAN] section only applies for netdevs of kind "macvlan", and accepts the following key:
 *
 */
export interface INetdevMacvlanOptions {
	/**
	 * The MACVLAN mode to use. The supported options are "private", "vepa", "bridge", "passthru", and "source".
	 *
	 * Added in version 211.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode=
	 */
	Mode: MaybeArray<string>;
	/**
	 * A whitespace-separated list of remote hardware addresses allowed on the MACVLAN. This option only has an effect in source mode. Use full colon-, hyphen- or
	 *
	 * dot-delimited hexadecimal. This option may appear more than once, in which case the lists are merged. If the empty string is assigned to this option, the list of
	 *
	 * hardware addresses defined prior to this is reset. Defaults to unset.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#SourceMACAddress=
	 */
	SourceMACAddress: MaybeArray<string>;
	/**
	 * Specifies the length of the receive queue for broadcast/multicast packets. An unsigned integer in the range 0...4294967294. Defaults to unset.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#BroadcastMulticastQueueLength=
	 */
	BroadcastMulticastQueueLength: MaybeArray<string>;
}
/**
 * The [IPVLAN] section only applies for netdevs of kind "ipvlan", and accepts the following key:
 *
 */
export interface INetdevIpvlanOptions {
	/**
	 * The IPVLAN mode to use. The supported options are "L2","L3" and "L3S".
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode=
	 */
	Mode: MaybeArray<string>;
	/**
	 * The IPVLAN flags to use. The supported options are "bridge","private" and "vepa".
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Flags=
	 */
	Flags: MaybeArray<string>;
}
/**
 * The [VXLAN] section only applies for netdevs of kind "vxlan", and accepts the following keys:
 *
 */
export interface INetdevVxlanOptions {
	/**
	 * The VXLAN Network Identifier (or VXLAN Segment ID). Takes a number in the range 1...16777215.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VNI=
	 */
	VNI: MaybeArray<string>;
	/**
	 * Configures destination IP address.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote=
	 */
	Remote: MaybeArray<string>;
	/**
	 * Configures local IP address. It must be an address on the underlying interface of the VXLAN interface, or one of the special values "ipv4_link_local",
	 *
	 * "ipv6_link_local", "dhcp4", "dhcp6", and "slaac". If one of the special values is specified, an address which matches the corresponding type on the underlying
	 *
	 * interface will be used. Defaults to unset.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local=
	 */
	Local: MaybeArray<string>;
	/**
	 * Configures VXLAN multicast group IP address. All members of a VXLAN must use the same multicast group address.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Group=
	 */
	Group: MaybeArray<string>;
	/**
	 * The Type Of Service byte value for a vxlan interface.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TOS=
	 */
	TOS: MaybeArray<string>;
	/**
	 * A fixed Time To Live N on Virtual eXtensible Local Area Network packets. Takes "inherit" or a number in the range 0...255. 0 is a special value meaning inherit the
	 *
	 * inner protocol's TTL value.  "inherit" means that it will inherit the outer protocol's TTL value.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TTL=
	 */
	TTL: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, enables dynamic MAC learning to discover remote MAC addresses.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MacLearning=
	 */
	MacLearning: MaybeArray<string>;
	/**
	 * The lifetime of Forwarding Database entry learnt by the kernel, in seconds.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FDBAgeingSec=
	 */
	FDBAgeingSec: MaybeArray<string>;
	/**
	 * Configures maximum number of FDB entries.
	 *
	 * Added in version 228.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MaximumFDBEntries=
	 */
	MaximumFDBEntries: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, bridge-connected VXLAN tunnel endpoint answers ARP requests from the local bridge on behalf of remote Distributed Overlay Virtual
	 *
	 * Ethernet (DOVE)[7] clients. Defaults to false.
	 *
	 * Added in version 233.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ReduceARPProxy=
	 */
	ReduceARPProxy: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, enables netlink LLADDR miss notifications.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#L2MissNotification=
	 */
	L2MissNotification: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, enables netlink IP address miss notifications.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#L3MissNotification=
	 */
	L3MissNotification: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, route short circuiting is turned on.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteShortCircuit=
	 */
	RouteShortCircuit: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, transmitting UDP checksums when doing VXLAN/IPv4 is turned on.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPChecksum=
	 */
	UDPChecksum: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, sending zero checksums in VXLAN/IPv6 is turned on.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumTx=
	 */
	UDP6ZeroChecksumTx: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, receiving zero checksums in VXLAN/IPv6 is turned on.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumRx=
	 */
	UDP6ZeroChecksumRx: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, remote transmit checksum offload of VXLAN is turned on.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RemoteChecksumTx=
	 */
	RemoteChecksumTx: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, remote receive checksum offload in VXLAN is turned on.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RemoteChecksumRx=
	 */
	RemoteChecksumRx: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, it enables Group Policy VXLAN extension security label mechanism across network peers based on VXLAN. For details about the Group Policy
	 *
	 * VXLAN, see the VXLAN Group Policy[8] document. Defaults to false.
	 *
	 * Added in version 224.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GroupPolicyExtension=
	 */
	GroupPolicyExtension: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, Generic Protocol Extension extends the existing VXLAN protocol to provide protocol typing, OAM, and versioning capabilities. For details
	 *
	 * about the VXLAN GPE Header, see the Generic Protocol Extension for VXLAN[9] document. If destination port is not specified and Generic Protocol Extension is set
	 *
	 * then default port of 4790 is used. Defaults to false.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GenericProtocolExtension=
	 */
	GenericProtocolExtension: MaybeArray<string>;
	/**
	 * Configures the default destination UDP port. If the destination port is not specified then Linux kernel default will be used. Set to 4789 to get the IANA assigned
	 *
	 * value.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DestinationPort=
	 */
	DestinationPort: MaybeArray<string>;
	/**
	 * Configures the source port range for the VXLAN. The kernel assigns the source UDP port based on the flow to help the receiver to do load balancing. When this option
	 *
	 * is not set, the normal range of local UDP ports is used.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PortRange=
	 */
	PortRange: MaybeArray<string>;
	/**
	 * Specifies the flow label to use in outgoing packets. The valid range is 0-1048575.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FlowLabel=
	 */
	FlowLabel: MaybeArray<string>;
	/**
	 * Allows setting the IPv4 Do not Fragment (DF) bit in outgoing packets, or to inherit its value from the IPv4 inner header. Takes a boolean value, or "inherit". Set
	 *
	 * to "inherit" if the encapsulated protocol is IPv6. When unset, the kernel's default will be used.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPDoNotFragment=
	 */
	IPDoNotFragment: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the vxlan interface is created without any underlying network interface. Defaults to false, which means that a .network file that
	 *
	 * requests this VXLAN interface using VXLAN= is required for the VXLAN to be created.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Independent=
	 */
	Independent: MaybeArray<string>;
}
/**
 * The [GENEVE] section only applies for netdevs of kind "geneve", and accepts the following keys:
 *
 */
export interface INetdevGeneveOptions {
	/**
	 * Specifies the Virtual Network Identifier (VNI) to use, a number between 0 and 16777215. This field is mandatory.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Id=
	 */
	Id: MaybeArray<string>;
	/**
	 * Specifies the unicast destination IP address to use in outgoing packets.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote=
	 */
	Remote: MaybeArray<string>;
	/**
	 * Specifies the TOS value to use in outgoing packets. Takes a number between 1 and 255.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TOS=
	 */
	TOS: MaybeArray<string>;
	/**
	 * Accepts the same values as in the [VXLAN] section, except that when unset or set to 0, the kernel's default will be used, meaning that packet TTL will be set from
	 *
	 * /proc/sys/net/ipv4/ip_default_ttl.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TTL=
	 */
	TTL: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, specifies that UDP checksum is calculated for transmitted packets over IPv4.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPChecksum=
	 */
	UDPChecksum: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, skip UDP checksum calculation for transmitted packets over IPv6.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumTx=
	 */
	UDP6ZeroChecksumTx: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, allows incoming UDP packets over IPv6 with zero checksum field.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumRx=
	 */
	UDP6ZeroChecksumRx: MaybeArray<string>;
	/**
	 * Specifies destination port. Defaults to 6081. If not set or assigned the empty string, the default port of 6081 is used.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DestinationPort=
	 */
	DestinationPort: MaybeArray<string>;
	/**
	 * Specifies the flow label to use in outgoing packets.
	 *
	 * Added in version 234.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FlowLabel=
	 */
	FlowLabel: MaybeArray<string>;
	/**
	 * Accepts the same key as in [VXLAN] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPDoNotFragment=
	 */
	IPDoNotFragment: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, inner Layer 3 protocol is set as Protocol Type in the GENEVE header instead of Ethernet. Defaults to false.
	 *
	 * Added in version 254.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#InheritInnerProtocol=
	 */
	InheritInnerProtocol: MaybeArray<string>;
}
/**
 * The [BareUDP] section only applies for netdevs of kind "bareudp", and accepts the following keys:
 *
 */
export interface INetdevBareudpOptions {
	/**
	 * Specifies the destination UDP port (in range 1...65535). This is mandatory.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DestinationPort=
	 */
	DestinationPort: MaybeArray<string>;
	/**
	 * Specifies the L3 protocol. Takes one of "ipv4", "ipv6", "mpls-uc" or "mpls-mc". This is mandatory.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EtherType=
	 */
	EtherType: "ipv4" | "ipv6" | "mpls-uc" | "mpls-mc" | string;
}
/**
 * The [L2TP] section only applies for netdevs of kind "l2tp", and accepts the following keys:
 *
 */
export interface INetdevL2tpOptions {
	/**
	 * Specifies the tunnel identifier. Takes an number in the range 1...4294967295. The value used must match the "PeerTunnelId=" value being used at the peer. This
	 *
	 * setting is compulsory.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TunnelId=
	 */
	TunnelId: MaybeArray<string>;
	/**
	 * Specifies the peer tunnel id. Takes a number in the range 1...4294967295. The value used must match the "TunnelId=" value being used at the peer. This setting is
	 *
	 * compulsory.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PeerTunnelId=
	 */
	PeerTunnelId: MaybeArray<string>;
	/**
	 * Specifies the IP address of the remote peer. This setting is compulsory.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote=
	 */
	Remote: MaybeArray<string>;
	/**
	 * Specifies the IP address of a local interface. Takes an IP address, or the special values "auto", "static", or "dynamic". Optionally a name of a local interface can
	 *
	 * be specified after "@", e.g.  "192.168.0.1@eth0" or "auto@eth0". When an address is specified, then a local or specified interface must have the address, and the
	 *
	 * remote address must be accessible through the local address. If "auto", then one of the addresses on a local or specified interface which is accessible to the
	 *
	 * remote address will be used. Similarly, if "static" or "dynamic" is set, then one of the static or dynamic addresses will be used. Defaults to "auto".
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local=
	 */
	Local: MaybeArray<string>;
	/**
	 * Specifies the encapsulation type of the tunnel. Takes one of "udp" or "ip".
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EncapsulationType=
	 */
	EncapsulationType: "udp" | "ip" | string;
	/**
	 * Specifies the UDP source port to be used for the tunnel. When UDP encapsulation is selected it's mandatory. Ignored when IP encapsulation is selected.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPSourcePort=
	 */
	UDPSourcePort: MaybeArray<string>;
	/**
	 * Specifies destination port. When UDP encapsulation is selected it's mandatory. Ignored when IP encapsulation is selected.
	 *
	 * Added in version 245.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPDestinationPort=
	 */
	UDPDestinationPort: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, specifies that UDP checksum is calculated for transmitted packets over IPv4.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPChecksum=
	 */
	UDPChecksum: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, skip UDP checksum calculation for transmitted packets over IPv6.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumTx=
	 */
	UDP6ZeroChecksumTx: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, allows incoming UDP packets over IPv6 with zero checksum field.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumRx=
	 */
	UDP6ZeroChecksumRx: MaybeArray<string>;
}
/**
 * The [L2TPSession] section only applies for netdevs of kind "l2tp", and accepts the following keys:
 *
 */
export interface INetdevL2tpsessionOptions {
	/**
	 * Specifies the name of the session. This setting is compulsory.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Name=
	 */
	Name: MaybeArray<string>;
	/**
	 * Specifies the session identifier. Takes an number in the range 1...4294967295. The value used must match the "SessionId=" value being used at the peer. This setting
	 *
	 * is compulsory.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#SessionId=
	 */
	SessionId: MaybeArray<string>;
	/**
	 * Specifies the peer session identifier. Takes an number in the range 1...4294967295. The value used must match the "PeerSessionId=" value being used at the peer.
	 *
	 * This setting is compulsory.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PeerSessionId=
	 */
	PeerSessionId: MaybeArray<string>;
	/**
	 * Specifies layer2specific header type of the session. One of "none" or "default". Defaults to "default".
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Layer2SpecificHeader=
	 */
	Layer2SpecificHeader: MaybeArray<string>;
}
/**
 * The [MACsec] section only applies for network devices of kind "macsec", and accepts the following keys:
 *
 */
export interface INetdevMacsecOptions {
	/**
	 * Specifies the port to be used for the MACsec transmit channel. The port is used to make secure channel identifier (SCI). Takes a value between 1 and 65535. Defaults
	 *
	 * to unset.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port=
	 */
	Port: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, enable encryption. Defaults to unset.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Encrypt=
	 */
	Encrypt: MaybeArray<string>;
}
/**
 * The [MACsecReceiveChannel] section only applies for network devices of kind "macsec", and accepts the following keys:
 *
 */
export interface INetdevMacsecreceivechannelOptions {
	/**
	 * Specifies the port to be used for the MACsec receive channel. The port is used to make secure channel identifier (SCI). Takes a value between 1 and 65535. This
	 *
	 * option is compulsory, and is not set by default.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port=
	 */
	Port: MaybeArray<string>;
	/**
	 * Specifies the MAC address to be used for the MACsec receive channel. The MAC address used to make secure channel identifier (SCI). This setting is compulsory, and
	 *
	 * is not set by default.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
}
/**
 * The [MACsecTransmitAssociation] section only applies for network devices of kind "macsec", and accepts the following keys:
 *
 */
export interface INetdevMacsectransmitassociationOptions {
	/**
	 * Specifies the packet number to be used for replay protection and the construction of the initialization vector (along with the secure channel identifier [SCI]).
	 *
	 * Takes a value between 1-4,294,967,295. Defaults to unset.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketNumber=
	 */
	PacketNumber: MaybeArray<string>;
	/**
	 * Specifies the identification for the key. Takes a number between 0-255. This option is compulsory, and is not set by default.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyId=
	 */
	KeyId: MaybeArray<string>;
	/**
	 * Specifies the encryption key used in the transmission channel. The same key must be configured on the peer’s matching receive channel. This setting is compulsory,
	 *
	 * and is not set by default. Takes a 128-bit key encoded in a hexadecimal string, for example "dffafc8d7b9a43d5b9a3dfbbf6a30c16".
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Key=
	 */
	Key: MaybeArray<string>;
	/**
	 * Takes an absolute path to a file which contains a 128-bit key encoded in a hexadecimal string, which will be used in the transmission channel. When this option is
	 *
	 * specified, Key= is ignored. Note that the file must be readable by the user "systemd-network", so it should be, e.g., owned by "root:systemd-network" with a "0640"
	 *
	 * file mode. If the path refers to an AF_UNIX stream socket in the file system a connection is made to it and the key read from it.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyFile=
	 */
	KeyFile: MaybeArray<string>;
	/**
	 * Takes a boolean. If enabled, then the security association is activated. Defaults to unset.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Activate=
	 */
	Activate: MaybeArray<string>;
	/**
	 * Takes a boolean. If enabled, then the security association is used for encoding. Only one [MACsecTransmitAssociation] section can enable this option. When enabled,
	 *
	 * Activate=yes is implied. Defaults to unset.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UseForEncoding=
	 */
	UseForEncoding: MaybeArray<string>;
}
/**
 * The [MACsecReceiveAssociation] section only applies for network devices of kind "macsec", and accepts the following keys:
 *
 */
export interface INetdevMacsecreceiveassociationOptions {
	/**
	 * Accepts the same key as in [MACsecReceiveChannel] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port=
	 */
	Port: MaybeArray<string>;
	/**
	 * Accepts the same key as in [MACsecReceiveChannel] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
	/**
	 * Accepts the same key as in [MACsecTransmitAssociation] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketNumber=
	 */
	PacketNumber: MaybeArray<string>;
	/**
	 * Accepts the same key as in [MACsecTransmitAssociation] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyId=
	 */
	KeyId: MaybeArray<string>;
	/**
	 * Accepts the same key as in [MACsecTransmitAssociation] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Key=
	 */
	Key: MaybeArray<string>;
	/**
	 * Accepts the same key as in [MACsecTransmitAssociation] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyFile=
	 */
	KeyFile: MaybeArray<string>;
	/**
	 * Accepts the same key as in [MACsecTransmitAssociation] section.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Activate=
	 */
	Activate: MaybeArray<string>;
}
/**
 * The [Tunnel] section only applies for netdevs of kind "ipip", "sit", "gre", "gretap", "ip6gre", "ip6gretap", "vti", "vti6", "ip6tnl", and "erspan" and accepts the
 *
 * following keys:
 *
 */
export interface INetdevTunnelOptions {
	/**
	 * Takes a boolean value. When true, then the tunnel is externally controlled, which is also known as collect metadata mode, and most settings below like Local= or
	 *
	 * Remote= are ignored. This implies Independent=. Defaults to false.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#External=
	 */
	External: MaybeArray<string>;
	/**
	 * A static local address for tunneled packets. It must be an address on another interface of this host, or one of the special values "any", "ipv4_link_local",
	 *
	 * "ipv6_link_local", "dhcp4", "dhcp6", and "slaac". If one of the special values except for "any" is specified, an address which matches the corresponding type on the
	 *
	 * underlying interface will be used. Defaults to "any".
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local=
	 */
	Local: MaybeArray<string>;
	/**
	 * The remote endpoint of the tunnel. Takes an IP address or the special value "any".
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote=
	 */
	Remote: MaybeArray<string>;
	/**
	 * The Type Of Service byte value for a tunnel interface. For details about the TOS, see the Type of Service in the Internet Protocol Suite[10] document.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TOS=
	 */
	TOS: MaybeArray<string>;
	/**
	 * A fixed Time To Live N on tunneled packets. N is a number in the range 1...255. 0 is a special value meaning that packets inherit the TTL value. The default value
	 *
	 * for IPv4 tunnels is 0 (inherit). The default value for IPv6 tunnels is 64.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TTL=
	 */
	TTL: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, enables Path MTU Discovery on the tunnel. When IgnoreDontFragment= is enabled, defaults to false. Otherwise, defaults to true.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DiscoverPathMTU=
	 */
	DiscoverPathMTU: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, enables IPv4 Don't Fragment (DF) suppression on the tunnel. Defaults to false. Note that if IgnoreDontFragment= is set to true,
	 *
	 * DiscoverPathMTU= cannot be set to true. Only applicable to GRE, GRETAP, and ERSPAN tunnels.
	 *
	 * Added in version 254.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IgnoreDontFragment=
	 */
	IgnoreDontFragment: MaybeArray<string>;
	/**
	 * Configures the 20-bit flow label (see RFC 6437[11]) field in the IPv6 header (see RFC 2460[12]), which is used by a node to label packets of a flow. It is only used
	 *
	 * for IPv6 tunnels. A flow label of zero is used to indicate packets that have not been labeled. It can be configured to a value in the range 0...0xFFFFF, or be set
	 *
	 * to "inherit", in which case the original flowlabel is used.
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPv6FlowLabel=
	 */
	IPv6FlowLabel: MaybeArray<string>;
	/**
	 * Takes a boolean. When true, the Differentiated Service Code Point (DSCP) field will be copied to the inner header from outer header during the decapsulation of an
	 *
	 * IPv6 tunnel packet. DSCP is a field in an IP packet that enables different levels of service to be assigned to network traffic. Defaults to "no".
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#CopyDSCP=
	 */
	CopyDSCP: MaybeArray<string>;
	/**
	 * The Tunnel Encapsulation Limit option specifies how many additional levels of encapsulation are permitted to be prepended to the packet. For example, a Tunnel
	 *
	 * Encapsulation Limit option containing a limit value of zero means that a packet carrying that option may not enter another tunnel before exiting the current tunnel.
	 *
	 * (see RFC 2473[13]). The valid range is 0...255 and "none". Defaults to 4.
	 *
	 * Added in version 226.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EncapsulationLimit=
	 */
	EncapsulationLimit: MaybeArray<string>;
	/**
	 * The Key= parameter specifies the same key to use in both directions (InputKey= and OutputKey=). The Key= is either a number or an IPv4 address-like dotted quad. It
	 *
	 * is used as mark-configured SAD/SPD entry as part of the lookup key (both in data and control path) in IP XFRM (framework used to implement IPsec protocol). See
	 *
	 * ip-xfrm — transform configuration[14] for details. It is only used for VTI/VTI6, GRE, GRETAP, and ERSPAN tunnels.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Key=
	 */
	Key: MaybeArray<string>;
	/**
	 * The InputKey= parameter specifies the key to use for input. The format is same as Key=. It is only used for VTI/VTI6, GRE, GRETAP, and ERSPAN tunnels.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#InputKey=
	 */
	InputKey: MaybeArray<string>;
	/**
	 * The OutputKey= parameter specifies the key to use for output. The format is same as Key=. It is only used for VTI/VTI6, GRE, GRETAP, and ERSPAN tunnels.
	 *
	 * Added in version 231.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#OutputKey=
	 */
	OutputKey: MaybeArray<string>;
	/**
	 * An "ip6tnl" tunnel can be in one of three modes "ip6ip6" for IPv6 over IPv6, "ipip6" for IPv4 over IPv6 or "any" for either.
	 *
	 * Added in version 219.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode=
	 */
	Mode: MaybeArray<string>;
	/**
	 * Takes a boolean. When false (the default), the tunnel is always created over some network device, and a .network file that requests this tunnel using Tunnel= is
	 *
	 * required for the tunnel to be created. When true, the tunnel is created independently of any network as "tunnel@NONE".
	 *
	 * Added in version 235.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Independent=
	 */
	Independent: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to "yes", the loopback interface "lo" is used as the underlying device of the tunnel interface. Defaults to "no".
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AssignToLoopback=
	 */
	AssignToLoopback: MaybeArray<string>;
	/**
	 * Takes a boolean. When true allows tunnel traffic on ip6tnl devices where the remote endpoint is a local host address. When unset, the kernel's default will be used.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AllowLocalRemote=
	 */
	AllowLocalRemote: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies whether FooOverUDP= tunnel is to be configured. Defaults to false. This takes effects only for IPIP, SIT, GRE, and GRETAP tunnels. For
	 *
	 * more detail information see Foo over UDP[15]
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FooOverUDP=
	 */
	FooOverUDP: MaybeArray<string>;
	/**
	 * This setting specifies the UDP destination port for encapsulation. This field is mandatory when FooOverUDP=yes, and is not set by default.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FOUDestinationPort=
	 */
	FOUDestinationPort: MaybeArray<string>;
	/**
	 * This setting specifies the UDP source port for encapsulation. Defaults to 0 — that is, the source port for packets is left to the network stack to decide.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FOUSourcePort=
	 */
	FOUSourcePort: MaybeArray<string>;
	/**
	 * Accepts the same key as in the [FooOverUDP] section.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Encapsulation=
	 */
	Encapsulation: MaybeArray<string>;
	/**
	 * Reconfigure the tunnel for IPv6 Rapid Deployment[16], also known as 6rd. The value is an ISP-specific IPv6 prefix with a non-zero length. Only applicable to SIT
	 *
	 * tunnels.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPv6RapidDeploymentPrefix=
	 */
	IPv6RapidDeploymentPrefix: MaybeArray<string>;
	/**
	 * Takes a boolean. If set, configures the tunnel as Intra-Site Automatic Tunnel Addressing Protocol (ISATAP) tunnel. Only applicable to SIT tunnels. When unset, the
	 *
	 * kernel's default will be used.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ISATAP=
	 */
	ISATAP: MaybeArray<string>;
	/**
	 * Takes a boolean. If set to yes, then packets are serialized. Only applies for GRE, GRETAP, and ERSPAN tunnels. When unset, the kernel's default will be used.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#SerializeTunneledPackets=
	 */
	SerializeTunneledPackets: MaybeArray<string>;
	/**
	 * Specifies the ERSPAN version number. Takes 0 for version 0 (a.k.a. type I), 1 for version 1 (a.k.a. type II), or 2 for version 2 (a.k.a. type III). Defaults to 1.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANVersion=
	 */
	ERSPANVersion: MaybeArray<string>;
	/**
	 * Specifies the ERSPAN v1 index field for the interface. Takes an integer in the range 0...1048575, which is associated with the ERSPAN traffic's source port and
	 *
	 * direction. Only used when ERSPANVersion=1. Defaults to 0.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANIndex=
	 */
	ERSPANIndex: MaybeArray<string>;
	/**
	 * Specifies the ERSPAN v2 mirrored traffic's direction. Takes "ingress" or "egress". Only used when ERSPANVersion=2. Defaults to "ingress".
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANDirection=
	 */
	ERSPANDirection: MaybeArray<string>;
	/**
	 * Specifies an unique identifier of the ERSPAN v2 engine. Takes an integer in the range 0...63. Only used when ERSPANVersion=2. Defaults to 0.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANHardwareId=
	 */
	ERSPANHardwareId: MaybeArray<string>;
}
/**
 * The [FooOverUDP] section only applies for netdevs of kind "fou" and accepts the following keys:
 *
 */
export interface INetdevFoooverudpOptions {
	/**
	 * Specifies the encapsulation mechanism used to store networking packets of various protocols inside the UDP packets. Supports the following values: "FooOverUDP"
	 *
	 * provides the simplest no-frills model of UDP encapsulation, it simply encapsulates packets directly in the UDP payload.  "GenericUDPEncapsulation" is a generic and
	 *
	 * extensible encapsulation, it allows encapsulation of packets for any IP protocol and optional data as part of the encapsulation. For more detailed information see
	 *
	 * Generic UDP Encapsulation[17]. Defaults to "FooOverUDP".
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Encapsulation=
	 */
	Encapsulation: MaybeArray<string>;
	/**
	 * Specifies the port number where the encapsulated packets will arrive. Those packets will be removed and manually fed back into the network stack with the
	 *
	 * encapsulation removed to be sent to the real destination. This option is mandatory.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port=
	 */
	Port: MaybeArray<string>;
	/**
	 * Specifies the peer port number. Defaults to unset. Note that when peer port is set "Peer=" address is mandatory.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PeerPort=
	 */
	PeerPort: MaybeArray<string>;
	/**
	 * The Protocol= specifies the protocol number of the packets arriving at the UDP port. When Encapsulation=FooOverUDP, this field is mandatory and is not set by
	 *
	 * default. Takes an IP protocol name such as "gre" or "ipip", or an integer within the range 1...255. When Encapsulation=GenericUDPEncapsulation, this must not be
	 *
	 * specified.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Protocol=
	 */
	Protocol: MaybeArray<string>;
	/**
	 * Configures peer IP address. Note that when peer address is set "PeerPort=" is mandatory.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Peer=
	 */
	Peer: MaybeArray<string>;
	/**
	 * Configures local IP address.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local=
	 */
	Local: MaybeArray<string>;
}
/**
 * The [Peer] section only applies for netdevs of kind "veth" and accepts the following keys:
 *
 */
export interface INetdevPeerOptions {
	/**
	 * The interface name used when creating the netdev. This setting is compulsory.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Name=
	 */
	Name: MaybeArray<string>;
	/**
	 * The peer MACAddress, if not set, it is generated in the same way as the MAC address of the main interface.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress=
	 */
	MACAddress: MaybeArray<string>;
}
/**
 * The [VXCAN] section only applies for netdevs of kind "vxcan" and accepts the following key:
 *
 */
export interface INetdevVxcanOptions {
	/**
	 * The peer interface name used when creating the netdev. This setting is compulsory.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Peer=
	 */
	Peer: MaybeArray<string>;
}
/**
 * The [Tun] section only applies for netdevs of kind "tun", and accepts the following keys:
 *
 */
export interface INetdevTunOptions {
	/**
	 * Takes a boolean. Configures whether to use multiple file descriptors (queues) to parallelize packets sending and receiving. Defaults to "no".
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MultiQueue=
	 */
	MultiQueue: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures whether packets should be prepended with four extra bytes (two flag bytes and two protocol bytes). If disabled, it indicates that the
	 *
	 * packets will be pure IP packets. Defaults to "no".
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketInfo=
	 */
	PacketInfo: MaybeArray<string>;
	/**
	 * Takes a boolean. Configures IFF_VNET_HDR flag for a tun or tap device. It allows sending and receiving larger Generic Segmentation Offload (GSO) packets. This may
	 *
	 * increase throughput significantly. Defaults to "no".
	 *
	 * Added in version 223.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VNetHeader=
	 */
	VNetHeader: MaybeArray<string>;
	/**
	 * User to grant access to the /dev/net/tun device.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#User=
	 */
	User: MaybeArray<string>;
	/**
	 * Group to grant access to the /dev/net/tun device.
	 *
	 * Added in version 215.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Group=
	 */
	Group: MaybeArray<string>;
	/**
	 * Takes a boolean. If enabled, to make the interface maintain its carrier status, the file descriptor of the interface is kept open. This may be useful to keep the
	 *
	 * interface in running state, for example while the backing process is temporarily shutdown. Defaults to "no".
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeepCarrier=
	 */
	KeepCarrier: MaybeArray<string>;
}
/**
 * The [WireGuard] section accepts the following keys:
 *
 */
export interface INetdevWireguardOptions {
	/**
	 * The Base64 encoded private key for the interface. It can be generated using the wg genkey command (see wg(8)). This option or PrivateKeyFile= is mandatory to use
	 *
	 * WireGuard. Note that because this information is secret, you may want to set the permissions of the .netdev file to be owned by "root:systemd-network" with a "0640"
	 *
	 * file mode.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PrivateKey=
	 */
	PrivateKey: MaybeArray<string>;
	/**
	 * Takes an absolute path to a file which contains the Base64 encoded private key for the interface. When this option is specified, then PrivateKey= is ignored. Note
	 *
	 * that the file must be readable by the user "systemd-network", so it should be, e.g., owned by "root:systemd-network" with a "0640" file mode. If the path refers to
	 *
	 * an AF_UNIX stream socket in the file system a connection is made to it and the key read from it.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PrivateKeyFile=
	 */
	PrivateKeyFile: MaybeArray<string>;
	/**
	 * Sets UDP port for listening. Takes either value between 1 and 65535 or "auto". If "auto" is specified, the port is automatically generated based on interface name.
	 *
	 * Defaults to "auto".
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ListenPort=
	 */
	ListenPort: MaybeArray<string>;
	/**
	 * Sets a firewall mark on outgoing WireGuard packets from this interface. Takes a number between 1 and 4294967295.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FirewallMark=
	 */
	FirewallMark: MaybeArray<string>;
	/**
	 * The table identifier for the routes to the addresses specified in the AllowedIPs=. Takes a negative boolean value, one of the predefined names "default", "main",
	 *
	 * and "local", names defined in RouteTable= in networkd.conf(5), or a number in the range 1...4294967295. When "off" the routes to the addresses specified in the
	 *
	 * AllowedIPs= setting will not be configured. Defaults to false. This setting will be ignored when the same setting is specified in the [WireGuardPeer] section.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteTable=
	 */
	RouteTable: MaybeArray<string>;
	/**
	 * The priority of the routes to the addresses specified in the AllowedIPs=. Takes an integer in the range 0...4294967295. Defaults to 0 for IPv4 addresses, and 1024
	 *
	 * for IPv6 addresses. This setting will be ignored when the same setting is specified in the [WireGuardPeer] section.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteMetric=
	 */
	RouteMetric: MaybeArray<string>;
}
/**
 * The [WireGuardPeer] section accepts the following keys:
 *
 */
export interface INetdevWireguardpeerOptions {
	/**
	 * Sets a Base64 encoded public key calculated by wg pubkey (see wg(8)) from a private key, and usually transmitted out of band to the author of the configuration
	 *
	 * file. This option is mandatory for this section.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PublicKey=
	 */
	PublicKey: MaybeArray<string>;
	/**
	 * Optional preshared key for the interface. It can be generated by the wg genpsk command. This option adds an additional layer of symmetric-key cryptography to be
	 *
	 * mixed into the already existing public-key cryptography, for post-quantum resistance. Note that because this information is secret, you may want to set the
	 *
	 * permissions of the .netdev file to be owned by "root:systemd-network" with a "0640" file mode.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PresharedKey=
	 */
	PresharedKey: MaybeArray<string>;
	/**
	 * Takes an absolute path to a file which contains the Base64 encoded preshared key for the peer. When this option is specified, then PresharedKey= is ignored. Note
	 *
	 * that the file must be readable by the user "systemd-network", so it should be, e.g., owned by "root:systemd-network" with a "0640" file mode. If the path refers to
	 *
	 * an AF_UNIX stream socket in the file system a connection is made to it and the key read from it.
	 *
	 * Added in version 242.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PresharedKeyFile=
	 */
	PresharedKeyFile: MaybeArray<string>;
	/**
	 * Sets a comma-separated list of IP (v4 or v6) addresses with CIDR masks from which this peer is allowed to send incoming traffic and to which outgoing traffic for
	 *
	 * this peer is directed. This setting can be specified multiple times. If an empty string is assigned, then the all previous assignments are cleared.
	 *
	 * The catch-all 0.0.0.0/0 may be specified for matching all IPv4 addresses, and ::/0 may be specified for matching all IPv6 addresses.
	 *
	 * Note that this only affects routing inside the network interface itself, i.e. the packets that pass through the tunnel itself. To cause packets to be sent via the
	 *
	 * tunnel in the first place, an appropriate route needs to be added as well — either in the "[Routes]" section on the ".network" matching the wireguard interface, or
	 *
	 * externally to systemd-networkd.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AllowedIPs=
	 */
	AllowedIPs: MaybeArray<string>;
	/**
	 * Sets an endpoint IP address or hostname, followed by a colon, and then a port number. IPv6 address must be in the square brackets. For example,
	 *
	 * "111.222.333.444:51820" for IPv4 and "[1111:2222::3333]:51820" for IPv6 address. This endpoint will be updated automatically once to the most recent source IP
	 *
	 * address and port of correctly authenticated packets from the peer at configuration time.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Endpoint=
	 */
	Endpoint: MaybeArray<string>;
	/**
	 * Sets a seconds interval, between 1 and 65535 inclusive, of how often to send an authenticated empty packet to the peer for the purpose of keeping a stateful
	 *
	 * firewall or NAT mapping valid persistently. For example, if the interface very rarely sends traffic, but it might at anytime receive traffic from a peer, and it is
	 *
	 * behind NAT, the interface might benefit from having a persistent keepalive interval of 25 seconds. If set to 0 or "off", this option is disabled. By default or when
	 *
	 * unspecified, this option is off. Most users will not need this.
	 *
	 * Added in version 237.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PersistentKeepalive=
	 */
	PersistentKeepalive: MaybeArray<string>;
	/**
	 * The table identifier for the routes to the addresses specified in the AllowedIPs=. Takes a negative boolean value, one of the predefined names "default", "main",
	 *
	 * and "local", names defined in RouteTable= in networkd.conf(5), or a number in the range 1...4294967295. Defaults to unset, and the value specified in the same
	 *
	 * setting in the [WireGuard] section will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteTable=
	 */
	RouteTable: MaybeArray<string>;
	/**
	 * The priority of the routes to the addresses specified in the AllowedIPs=. Takes an integer in the range 0...4294967295. Defaults to unset, and the value specified
	 *
	 * in the same setting in the [WireGuard] section will be used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteMetric=
	 */
	RouteMetric: MaybeArray<string>;
}
/**
 * The [Bond] section accepts the following key:
 *
 */
export interface INetdevBondOptions {
	/**
	 * Specifies one of the bonding policies. The default is "balance-rr" (round robin). Possible values are "balance-rr", "active-backup", "balance-xor", "broadcast",
	 *
	 * "802.3ad", "balance-tlb", and "balance-alb".
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode=
	 */
	Mode: MaybeArray<string>;
	/**
	 * Selects the transmit hash policy to use for slave selection in balance-xor, 802.3ad, and tlb modes. Possible values are "layer2", "layer3+4", "layer2+3",
	 *
	 * "encap2+3", and "encap3+4".
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TransmitHashPolicy=
	 */
	TransmitHashPolicy: MaybeArray<string>;
	/**
	 * Specifies the rate with which link partner transmits Link Aggregation Control Protocol Data Unit packets in 802.3ad mode. Possible values are "slow", which requests
	 *
	 * partner to transmit LACPDUs every 30 seconds, and "fast", which requests partner to transmit LACPDUs every second. The default value is "slow".
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#LACPTransmitRate=
	 */
	LACPTransmitRate: MaybeArray<string>;
	/**
	 * Specifies the frequency that Media Independent Interface link monitoring will occur. A value of zero disables MII link monitoring. This value is rounded down to the
	 *
	 * nearest millisecond. The default value is 0.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MIIMonitorSec=
	 */
	MIIMonitorSec: MaybeArray<string>;
	/**
	 * Specifies the delay before a link is enabled after a link up status has been detected. This value is rounded down to a multiple of MIIMonitorSec=. The default value
	 *
	 * is 0.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UpDelaySec=
	 */
	UpDelaySec: MaybeArray<string>;
	/**
	 * Specifies the delay before a link is disabled after a link down status has been detected. This value is rounded down to a multiple of MIIMonitorSec=. The default
	 *
	 * value is 0.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DownDelaySec=
	 */
	DownDelaySec: MaybeArray<string>;
	/**
	 * Specifies the number of seconds between instances where the bonding driver sends learning packets to each slave peer switch. The valid range is 1...0x7fffffff; the
	 *
	 * default value is 1. This option has an effect only for the balance-tlb and balance-alb modes.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#LearnPacketIntervalSec=
	 */
	LearnPacketIntervalSec: MaybeArray<string>;
	/**
	 * Specifies the 802.3ad aggregation selection logic to use. Possible values are "stable", "bandwidth" and "count".
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdSelect=
	 */
	AdSelect: MaybeArray<string>;
	/**
	 * Specifies the 802.3ad actor system priority. Takes a number in the range 1...65535.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdActorSystemPriority=
	 */
	AdActorSystemPriority: MaybeArray<string>;
	/**
	 * Specifies the 802.3ad user defined portion of the port key. Takes a number in the range 0...1023.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdUserPortKey=
	 */
	AdUserPortKey: MaybeArray<string>;
	/**
	 * Specifies the 802.3ad system MAC address. This cannot be a null or multicast address.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdActorSystem=
	 */
	AdActorSystem: MaybeArray<string>;
	/**
	 * Specifies whether the active-backup mode should set all slaves to the same MAC address at the time of enslavement or, when enabled, to perform special handling of
	 *
	 * the bond's MAC address in accordance with the selected policy. The default policy is none. Possible values are "none", "active" and "follow".
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FailOverMACPolicy=
	 */
	FailOverMACPolicy: MaybeArray<string>;
	/**
	 * Specifies whether or not ARP probes and replies should be validated in any mode that supports ARP monitoring, or whether non-ARP traffic should be filtered
	 *
	 * (disregarded) for link monitoring purposes. Possible values are "none", "active", "backup" and "all".
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPValidate=
	 */
	ARPValidate: MaybeArray<string>;
	/**
	 * Specifies the ARP link monitoring frequency. A value of 0 disables ARP monitoring. The default value is 0, and the default unit seconds.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPIntervalSec=
	 */
	ARPIntervalSec: MaybeArray<string>;
	/**
	 * Specifies the IP addresses to use as ARP monitoring peers when ARPIntervalSec= is greater than 0. These are the targets of the ARP request sent to determine the
	 *
	 * health of the link to the targets. Specify these values in IPv4 dotted decimal format. At least one IP address must be given for ARP monitoring to function. The
	 *
	 * maximum number of targets that can be specified is 16. The default value is no IP addresses.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPIPTargets=
	 */
	ARPIPTargets: MaybeArray<string>;
	/**
	 * Specifies the quantity of ARPIPTargets= that must be reachable in order for the ARP monitor to consider a slave as being up. This option affects only active-backup
	 *
	 * mode for slaves with ARPValidate enabled. Possible values are "any" and "all".
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPAllTargets=
	 */
	ARPAllTargets: MaybeArray<string>;
	/**
	 * Specifies the reselection policy for the primary slave. This affects how the primary slave is chosen to become the active slave when failure of the active slave or
	 *
	 * recovery of the primary slave occurs. This option is designed to prevent flip-flopping between the primary slave and other slaves. Possible values are "always",
	 *
	 * "better" and "failure".
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PrimaryReselectPolicy=
	 */
	PrimaryReselectPolicy: MaybeArray<string>;
	/**
	 * Specifies the number of IGMP membership reports to be issued after a failover event. One membership report is issued immediately after the failover, subsequent
	 *
	 * packets are sent in each 200ms interval. The valid range is 0...255. Defaults to 1. A value of 0 prevents the IGMP membership report from being issued in response
	 *
	 * to the failover event.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ResendIGMP=
	 */
	ResendIGMP: MaybeArray<string>;
	/**
	 * Specify the number of packets to transmit through a slave before moving to the next one. When set to 0, then a slave is chosen at random. The valid range is
	 *
	 * 0...65535. Defaults to 1. This option only has effect when in balance-rr mode.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketsPerSlave=
	 */
	PacketsPerSlave: MaybeArray<string>;
	/**
	 * Specify the number of peer notifications (gratuitous ARPs and unsolicited IPv6 Neighbor Advertisements) to be issued after a failover event. As soon as the link is
	 *
	 * up on the new slave, a peer notification is sent on the bonding device and each VLAN sub-device. This is repeated at each link monitor interval (ARPIntervalSec or
	 *
	 * MIIMonitorSec, whichever is active) if the number is greater than 1. The valid range is 0...255. The default value is 1. These options affect only the active-backup
	 *
	 * mode.
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GratuitousARP=
	 */
	GratuitousARP: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies that duplicate frames (received on inactive ports) should be dropped when false, or delivered when true. Normally, bonding will drop
	 *
	 * duplicate frames (received on inactive ports), which is desirable for most users. But there are some times it is nice to allow duplicate frames to be delivered. The
	 *
	 * default value is false (drop duplicate frames received on inactive ports).
	 *
	 * Added in version 220.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AllSlavesActive=
	 */
	AllSlavesActive: MaybeArray<string>;
	/**
	 * Takes a boolean. Specifies if dynamic shuffling of flows is enabled. Applies only for balance-tlb mode. Defaults to unset.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DynamicTransmitLoadBalancing=
	 */
	DynamicTransmitLoadBalancing: MaybeArray<string>;
	/**
	 * Specifies the minimum number of links that must be active before asserting carrier. The default value is 0.
	 *
	 * Added in version 220.
	 *
	 * For more detail information see Linux Ethernet Bonding Driver HOWTO[1]
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MinLinks=
	 */
	MinLinks: MaybeArray<string>;
}
/**
 * The [Xfrm] section accepts the following keys:
 *
 */
export interface INetdevXfrmOptions {
	/**
	 * Sets the ID/key of the xfrm interface which needs to be associated with a SA/policy. Can be decimal or hexadecimal, valid range is 1-0xffffffff. This is mandatory.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#InterfaceId=
	 */
	InterfaceId: MaybeArray<string>;
	/**
	 * Takes a boolean. If false (the default), the xfrm interface must have an underlying device which can be used for hardware offloading.
	 *
	 * Added in version 243.
	 *
	 * For more detail information see Virtual XFRM Interfaces[18].
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Independent=
	 */
	Independent: MaybeArray<string>;
}
/**
 * The [VRF] section only applies for netdevs of kind "vrf" and accepts the following key:
 *
 */
export interface INetdevVrfOptions {
	/**
	 * The numeric routing table identifier. This setting is compulsory.
	 *
	 * Added in version 243.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Table=
	 */
	Table: MaybeArray<string>;
}
/**
 * The [BatmanAdvanced] section only applies for netdevs of kind "batadv" and accepts the following keys:
 *
 */
export interface INetdevBatmanadvancedOptions {
	/**
	 * Takes one of "off", "server", or "client". A batman-adv node can either run in server mode (sharing its internet connection with the mesh) or in client mode
	 *
	 * (searching for the most suitable internet connection in the mesh) or having the gateway support turned off entirely (which is the default setting).
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GatewayMode=
	 */
	GatewayMode: "off" | "server" | "client" | string;
	/**
	 * Takes a boolean value. Enables or disables aggregation of originator messages. Defaults to true.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Aggregation=
	 */
	Aggregation: MaybeArray<string>;
	/**
	 * Takes a boolean value. Enables or disables avoidance of loops on bridges. Defaults to true.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#BridgeLoopAvoidance=
	 */
	BridgeLoopAvoidance: MaybeArray<string>;
	/**
	 * Takes a boolean value. Enables or disables the distributed ARP table. Defaults to true.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DistributedArpTable=
	 */
	DistributedArpTable: MaybeArray<string>;
	/**
	 * Takes a boolean value. Enables or disables fragmentation. Defaults to true.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Fragmentation=
	 */
	Fragmentation: MaybeArray<string>;
	/**
	 * The hop penalty setting allows one to modify batctl(8) preference for multihop routes vs. short routes. This integer value is applied to the TQ (Transmit Quality)
	 *
	 * of each forwarded OGM (Originator Message), thereby propagating the cost of an extra hop (the packet has to be received and retransmitted which costs airtime). A
	 *
	 * higher hop penalty will make it more unlikely that other nodes will choose this node as intermediate hop towards any given destination. The default hop penalty of
	 *
	 * '15' is a reasonable value for most setups and probably does not need to be changed. However, mobile nodes could choose a value of 255 (maximum value) to avoid
	 *
	 * being chosen as a router by other nodes. The minimum value is 0.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#HopPenalty=
	 */
	HopPenalty: MaybeArray<string>;
	/**
	 * The value specifies the interval in seconds, unless another time unit is specified in which batman-adv floods the network with its protocol information. See
	 *
	 * systemd.time(7) for more information.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#OriginatorIntervalSec=
	 */
	OriginatorIntervalSec: MaybeArray<string>;
	/**
	 * If the node is a server, this parameter is used to inform other nodes in the network about this node's internet connection download bandwidth in bits per second.
	 *
	 * Just enter any number suffixed with K, M, G or T (base 1000) and the batman-adv module will propagate the entered value in the mesh.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GatewayBandwidthDown=
	 */
	GatewayBandwidthDown: MaybeArray<string>;
	/**
	 * If the node is a server, this parameter is used to inform other nodes in the network about this node's internet connection upload bandwidth in bits per second. Just
	 *
	 * enter any number suffixed with K, M, G or T (base 1000) and the batman-adv module will propagate the entered value in the mesh.
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GatewayBandwidthUp=
	 */
	GatewayBandwidthUp: MaybeArray<string>;
	/**
	 * This can be either "batman-v" or "batman-iv" and describes which routing_algo of batctl(8) to use. The algorithm cannot be changed after interface creation.
	 *
	 * Defaults to "batman-v".
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RoutingAlgorithm=
	 */
	RoutingAlgorithm: MaybeArray<string>;
}
/**
 * The [IPoIB] section only applies for netdevs of kind "ipoib" and accepts the following keys:
 *
 */
export interface INetdevIpoibOptions {
	/**
	 * Takes an integer in the range 1...0xffff, except for 0x8000. Defaults to unset, and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PartitionKey=
	 */
	PartitionKey: MaybeArray<string>;
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
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode=
	 */
	Mode: "the" | "special" | "values" | "datagram" | "connected" | string;
	/**
	 * Takes an boolean value. When true, the kernel ignores multicast groups handled by userspace. Defaults to unset, and the kernel's default is used.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IgnoreUserspaceMulticastGroup=
	 */
	IgnoreUserspaceMulticastGroup: MaybeArray<string>;
}
/**
 * The [WLAN] section only applies to WLAN interfaces, and accepts the following keys:
 *
 */
export interface INetdevWlanOptions {
	/**
	 * Specifies the name or index of the physical WLAN device (e.g.  "0" or "phy0"). The list of the physical WLAN devices that exist on the host can be obtained by iw
	 *
	 * phy command. This option is mandatory.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PhysicalDevice=
	 */
	PhysicalDevice: MaybeArray<string>;
	/**
	 * Specifies the type of the interface. Takes one of the "ad-hoc", "station", "ap", "ap-vlan", "wds", "monitor", "mesh-point", "p2p-client", "p2p-go", "p2p-device",
	 *
	 * "ocb", and "nan". This option is mandatory.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Type=
	 */
	Type: "the" | "ad-hoc" | "station" | "ap" | "ap-vlan" | "wds" | "monitor" | "mesh-point" | "p2p-client" | "p2p-go" | "p2p-device" | "ocb" | "nan" | string;
	/**
	 * Enables the Wireless Distribution System (WDS) mode on the interface. The mode is also known as the "4 address mode". Takes a boolean value. Defaults to unset, and
	 *
	 * the kernel's default will be used.
	 *
	 * Added in version 251.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#WDS=
	 */
	WDS: MaybeArray<string>;
}
export interface INetdevUnit {
	Match: INetdevMatchOptions;
	Netdev: INetdevOptions;
	Bridge: INetdevBridgeOptions;
	Vlan: INetdevVlanOptions;
	Macvlan: INetdevMacvlanOptions;
	Ipvlan: INetdevIpvlanOptions;
	Vxlan: INetdevVxlanOptions;
	Geneve: INetdevGeneveOptions;
	Bareudp: INetdevBareudpOptions;
	L2tp: INetdevL2tpOptions;
	L2tpsession: INetdevL2tpsessionOptions;
	Macsec: INetdevMacsecOptions;
	Macsecreceivechannel: INetdevMacsecreceivechannelOptions;
	Macsectransmitassociation: INetdevMacsectransmitassociationOptions;
	Macsecreceiveassociation: INetdevMacsecreceiveassociationOptions;
	Tunnel: INetdevTunnelOptions;
	Foooverudp: INetdevFoooverudpOptions;
	Peer: INetdevPeerOptions;
	Vxcan: INetdevVxcanOptions;
	Tun: INetdevTunOptions;
	Wireguard: INetdevWireguardOptions;
	Wireguardpeer: INetdevWireguardpeerOptions;
	Bond: INetdevBondOptions;
	Xfrm: INetdevXfrmOptions;
	Vrf: INetdevVrfOptions;
	Batmanadvanced: INetdevBatmanadvancedOptions;
	Ipoib: INetdevIpoibOptions;
	Wlan: INetdevWlanOptions;
}
