// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface INetworkMatchSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PermanentMACAddress= */
	PermanentMACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Path= */
	Path?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Driver= */
	Driver?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Type= */
	Type?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Kind= */
	Kind?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Property= */
	Property?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Name= */
	Name?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#WLANInterfaceType= */
	WLANInterfaceType?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SSID= */
	SSID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BSSID= */
	BSSID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Host= */
	Host?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Virtualization= */
	Virtualization?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KernelCommandLine= */
	KernelCommandLine?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KernelVersion= */
	KernelVersion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Credential= */
	Credential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Architecture= */
	Architecture?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Firmware= */
	Firmware?: MaybeArray<string>;
}

export const networkMatchFields: readonly string[] = [
	'MACAddress',
	'PermanentMACAddress',
	'Path',
	'Driver',
	'Type',
	'Kind',
	'Property',
	'Name',
	'WLANInterfaceType',
	'SSID',
	'BSSID',
	'Host',
	'Virtualization',
	'KernelCommandLine',
	'KernelVersion',
	'Credential',
	'Architecture',
	'Firmware',
];

export interface INetworkLinkSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes= */
	MTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ARP= */
	ARP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Multicast= */
	Multicast?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AllMulticast= */
	AllMulticast?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Promiscuous= */
	Promiscuous?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Unmanaged= */
	Unmanaged?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Group= */
	Group?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequiredForOnline= */
	RequiredForOnline?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequiredFamilyForOnline= */
	RequiredFamilyForOnline?: 'ipv4' | 'ipv6' | 'both' | 'any' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ActivationPolicy= */
	ActivationPolicy?: 'up' | 'always-up' | 'manual' | 'always-down' | 'down' | 'bound' | string;
}

export const networkLinkFields: readonly string[] = [
	'MACAddress',
	'MTUBytes',
	'ARP',
	'Multicast',
	'AllMulticast',
	'Promiscuous',
	'Unmanaged',
	'Group',
	'RequiredForOnline',
	'RequiredFamilyForOnline',
	'ActivationPolicy',
];

export interface INetworkSrIov_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VirtualFunction= */
	VirtualFunction?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANId= */
	VLANId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QualityOfService= */
	QualityOfService?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANProtocol= */
	VLANProtocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACSpoofCheck= */
	MACSpoofCheck?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QueryReceiveSideScaling= */
	QueryReceiveSideScaling?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Trust= */
	Trust?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LinkState= */
	LinkState?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
}

export const networkSrIov_SectionOptionsFields: readonly string[] = [
	'VirtualFunction',
	'VLANId',
	'QualityOfService',
	'VLANProtocol',
	'MACSpoofCheck',
	'QueryReceiveSideScaling',
	'Trust',
	'LinkState',
	'MACAddress',
];

export interface INetworkNetworkSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Description= */
	Description?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCP= */
	DHCP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCPServer= */
	DHCPServer?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LinkLocalAddressing= */
	LinkLocalAddressing?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6LinkLocalAddressGenerationMode= */
	IPv6LinkLocalAddressGenerationMode?: 'eui64' | 'none' | 'stable-privacy' | 'random' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6StableSecretAddress= */
	IPv6StableSecretAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4LLStartAddress= */
	IPv4LLStartAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4LLRoute= */
	IPv4LLRoute?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultRouteOnDevice= */
	DefaultRouteOnDevice?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LLMNR= */
	LLMNR?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastDNS= */
	MulticastDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSOverTLS= */
	DNSOverTLS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSSEC= */
	DNSSEC?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSSECNegativeTrustAnchors= */
	DNSSECNegativeTrustAnchors?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LLDP= */
	LLDP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitLLDP= */
	EmitLLDP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BindCarrier= */
	BindCarrier?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address= */
	Address?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Gateway= */
	Gateway?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNS= */
	DNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Domains= */
	Domains?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSDefaultRoute= */
	DNSDefaultRoute?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NTP= */
	NTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPForward= */
	IPForward?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPMasquerade= */
	IPMasquerade?: 'ipv4' | 'ipv6' | 'both' | 'no' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6PrivacyExtensions= */
	IPv6PrivacyExtensions?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6AcceptRA= */
	IPv6AcceptRA?: MaybeArray<BooleanType>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6DuplicateAddressDetection= */
	IPv6DuplicateAddressDetection?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6HopLimit= */
	IPv6HopLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4AcceptLocal= */
	IPv4AcceptLocal?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4RouteLocalnet= */
	IPv4RouteLocalnet?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv4ProxyARP= */
	IPv4ProxyARP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6ProxyNDP= */
	IPv6ProxyNDP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6ProxyNDPAddress= */
	IPv6ProxyNDPAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6SendRA= */
	IPv6SendRA?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCPPrefixDelegation= */
	DHCPPrefixDelegation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6MTUBytes= */
	IPv6MTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KeepMaster= */
	KeepMaster?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced= */
	BatmanAdvanced?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced= */
	Bond?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced= */
	Bridge?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BatmanAdvanced= */
	VRF?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	IPoIB?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	IPVLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	IPVTAP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	MACsec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	MACVLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	MACVTAP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	Tunnel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	VLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	VXLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPoIB= */
	Xfrm?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ActiveSlave= */
	ActiveSlave?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrimarySlave= */
	PrimarySlave?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ConfigureWithoutCarrier= */
	ConfigureWithoutCarrier?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IgnoreCarrierLoss= */
	IgnoreCarrierLoss?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#KeepConfiguration= */
	KeepConfiguration?: MaybeArray<string>;
}

export const networkNetworkFields: readonly string[] = [
	'Description',
	'DHCP',
	'DHCPServer',
	'LinkLocalAddressing',
	'IPv6LinkLocalAddressGenerationMode',
	'IPv6StableSecretAddress',
	'IPv4LLStartAddress',
	'IPv4LLRoute',
	'DefaultRouteOnDevice',
	'LLMNR',
	'MulticastDNS',
	'DNSOverTLS',
	'DNSSEC',
	'DNSSECNegativeTrustAnchors',
	'LLDP',
	'EmitLLDP',
	'BindCarrier',
	'Address',
	'Gateway',
	'DNS',
	'Domains',
	'DNSDefaultRoute',
	'NTP',
	'IPForward',
	'IPMasquerade',
	'IPv6PrivacyExtensions',
	'IPv6AcceptRA',
	'IPv6DuplicateAddressDetection',
	'IPv6HopLimit',
	'IPv4AcceptLocal',
	'IPv4RouteLocalnet',
	'IPv4ProxyARP',
	'IPv6ProxyNDP',
	'IPv6ProxyNDPAddress',
	'IPv6SendRA',
	'DHCPPrefixDelegation',
	'IPv6MTUBytes',
	'KeepMaster',
	'BatmanAdvanced',
	'Bond',
	'Bridge',
	'VRF',
	'IPoIB',
	'IPVLAN',
	'IPVTAP',
	'MACsec',
	'MACVLAN',
	'MACVTAP',
	'Tunnel',
	'VLAN',
	'VXLAN',
	'Xfrm',
	'ActiveSlave',
	'PrimarySlave',
	'ConfigureWithoutCarrier',
	'IgnoreCarrierLoss',
	'KeepConfiguration',
];

export interface INetworkAddressSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address= */
	Address?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Peer= */
	Peer?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Broadcast= */
	Broadcast?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Label= */
	Label?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredLifetime= */
	PreferredLifetime?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Scope= */
	Scope?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HomeAddress= */
	HomeAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DuplicateAddressDetection= */
	DuplicateAddressDetection?: 'ipv4' | 'ipv6' | 'both' | 'none' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ManageTemporaryAddress= */
	ManageTemporaryAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AddPrefixRoute= */
	AddPrefixRoute?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AutoJoin= */
	AutoJoin?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel= */
	NetLabel?: MaybeArray<string>;
}

export const networkAddressFields: readonly string[] = [
	'Address',
	'Peer',
	'Broadcast',
	'Label',
	'PreferredLifetime',
	'Scope',
	'RouteMetric',
	'HomeAddress',
	'DuplicateAddressDetection',
	'ManageTemporaryAddress',
	'AddPrefixRoute',
	'AutoJoin',
	'NetLabel',
];

export interface INetworkNeighborSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address= */
	Address?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LinkLayerAddress= */
	LinkLayerAddress?: MaybeArray<string>;
}

export const networkNeighborFields: readonly string[] = ['Address', 'LinkLayerAddress'];

export interface INetworkIpv6addresslabel_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Label= */
	Label?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Prefix= */
	Prefix?: MaybeArray<string>;
}

export const networkIpv6addresslabel_SectionOptionsFields: readonly string[] = ['Label', 'Prefix'];

export interface INetworkRoutingpolicyruleSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TypeOfService= */
	TypeOfService?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#From= */
	From?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#To= */
	To?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FirewallMark= */
	FirewallMark?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Table= */
	Table?:
		| 'predefined'
		| 'names'
		| 'default'
		| 'main'
		| 'local'
		| 'names'
		| 'defined'
		| 'in'
		| 'RouteTable='
		| 'in'
		| 'networkd'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Priority= */
	Priority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IncomingInterface= */
	IncomingInterface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OutgoingInterface= */
	OutgoingInterface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SourcePort= */
	SourcePort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DestinationPort= */
	DestinationPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPProtocol= */
	IPProtocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InvertRule= */
	InvertRule?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Family= */
	Family?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#User= */
	User?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SuppressPrefixLength= */
	SuppressPrefixLength?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SuppressInterfaceGroup= */
	SuppressInterfaceGroup?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Type= */
	Type?: 'blackhole' | 'unreachable' | 'prohibit' | string;
}

export const networkRoutingpolicyruleFields: readonly string[] = [
	'TypeOfService',
	'From',
	'To',
	'FirewallMark',
	'Table',
	'Priority',
	'IncomingInterface',
	'OutgoingInterface',
	'SourcePort',
	'DestinationPort',
	'IPProtocol',
	'InvertRule',
	'Family',
	'User',
	'SuppressPrefixLength',
	'SuppressInterfaceGroup',
	'Type',
];

export interface INetworkNexthopSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Id= */
	Id?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Gateway= */
	Gateway?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Family= */
	Family?: 'the' | 'special' | 'values' | 'ipv4' | 'ipv6' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OnLink= */
	OnLink?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Blackhole= */
	Blackhole?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Group= */
	Group?: MaybeArray<string>;
}

export const networkNexthopFields: readonly string[] = ['Id', 'Gateway', 'Family', 'OnLink', 'Blackhole', 'Group'];

export interface INetworkRouteSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Gateway= */
	Gateway?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#GatewayOnLink= */
	GatewayOnLink?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Destination= */
	Destination?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Source= */
	Source?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Metric= */
	Metric?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPv6Preference= */
	IPv6Preference?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Scope= */
	Scope?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredSource= */
	PreferredSource?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Table= */
	Table?:
		| 'predefined'
		| 'names'
		| 'default'
		| 'main'
		| 'local'
		| 'names'
		| 'defined'
		| 'in'
		| 'RouteTable='
		| 'in'
		| 'networkd'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Protocol= */
	Protocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Type= */
	Type?:
		| 'unicast'
		| 'local'
		| 'broadcast'
		| 'anycast'
		| 'multicast'
		| 'blackhole'
		| 'unreachable'
		| 'prohibit'
		| 'throw'
		| 'nat'
		| 'xresolve'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialCongestionWindow= */
	InitialCongestionWindow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialAdvertisedReceiveWindow= */
	InitialAdvertisedReceiveWindow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuickAck= */
	QuickAck?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FastOpenNoCookie= */
	FastOpenNoCookie?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TTLPropagate= */
	TTLPropagate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes= */
	MTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TCPAdvertisedMaximumSegmentSize= */
	TCPAdvertisedMaximumSegmentSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TCPCongestionControlAlgorithm= */
	TCPCongestionControlAlgorithm?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NextHop= */
	NextHop?: MaybeArray<string>;
}

export const networkRouteFields: readonly string[] = [
	'Gateway',
	'GatewayOnLink',
	'Destination',
	'Source',
	'Metric',
	'IPv6Preference',
	'Scope',
	'PreferredSource',
	'Table',
	'Protocol',
	'Type',
	'InitialCongestionWindow',
	'InitialAdvertisedReceiveWindow',
	'QuickAck',
	'FastOpenNoCookie',
	'TTLPropagate',
	'MTUBytes',
	'TCPAdvertisedMaximumSegmentSize',
	'TCPCongestionControlAlgorithm',
	'NextHop',
];

export interface INetworkDhcpv4_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendHostname= */
	SendHostname?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Hostname= */
	Hostname?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	MUDURL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClientIdentifier= */
	ClientIdentifier?: 'mac' | 'duid' | 'duid-only' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VendorClassIdentifier= */
	VendorClassIdentifier?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UserClass= */
	UserClass?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DUIDType= */
	DUIDType?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DUIDRawData= */
	DUIDRawData?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IAID= */
	IAID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Anonymize= */
	Anonymize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequestOptions= */
	RequestOptions?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendOption= */
	SendOption?: 'uint8' | 'uint16' | 'uint32' | 'ipv4address' | 'string' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendVendorOption= */
	SendVendorOption?: 'uint8' | 'uint16' | 'uint32' | 'ipv4address' | 'string' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IPServiceType= */
	IPServiceType?: 'the' | 'special' | 'values' | 'none' | 'CS6' | 'CS4' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SocketPriority= */
	SocketPriority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Label= */
	Label?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	UseDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RoutesToDNS= */
	RoutesToDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseNTP= */
	UseNTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RoutesToNTP= */
	RoutesToNTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseSIP= */
	UseSIP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseMTU= */
	UseMTU?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseHostname= */
	UseHostname?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDomains= */
	UseDomains?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseRoutes= */
	UseRoutes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteTable= */
	RouteTable?:
		| 'predefined'
		| 'names'
		| 'default'
		| 'main'
		| 'local'
		| 'names'
		| 'defined'
		| 'in'
		| 'RouteTable='
		| 'in'
		| 'networkd'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMTUBytes= */
	RouteMTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuickAck= */
	QuickAck?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseGateway= */
	UseGateway?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseTimezone= */
	UseTimezone?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Use6RD= */
	Use6RD?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FallbackLeaseLifetimeSec= */
	FallbackLeaseLifetimeSec?: 'forever' | 'infinity' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RequestBroadcast= */
	RequestBroadcast?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MaxAttempts= */
	MaxAttempts?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ListenPort= */
	ListenPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DenyList= */
	DenyList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AllowList= */
	AllowList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendRelease= */
	SendRelease?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendDecline= */
	SendDecline?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel= */
	NetLabel?: MaybeArray<string>;
}

export const networkDhcpv4_SectionOptionsFields: readonly string[] = [
	'SendHostname',
	'Hostname',
	'MUDURL',
	'ClientIdentifier',
	'VendorClassIdentifier',
	'UserClass',
	'DUIDType',
	'DUIDRawData',
	'IAID',
	'Anonymize',
	'RequestOptions',
	'SendOption',
	'SendVendorOption',
	'IPServiceType',
	'SocketPriority',
	'Label',
	'UseDNS',
	'RoutesToDNS',
	'UseNTP',
	'RoutesToNTP',
	'UseSIP',
	'UseMTU',
	'UseHostname',
	'UseDomains',
	'UseRoutes',
	'RouteMetric',
	'RouteTable',
	'RouteMTUBytes',
	'QuickAck',
	'UseGateway',
	'UseTimezone',
	'Use6RD',
	'FallbackLeaseLifetimeSec',
	'RequestBroadcast',
	'MaxAttempts',
	'ListenPort',
	'DenyList',
	'AllowList',
	'SendRelease',
	'SendDecline',
	'NetLabel',
];

export interface INetworkDhcpv6_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	MUDURL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	IAID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	DUIDType?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	DUIDRawData?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	RequestOptions?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendOption= */
	SendOption?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendVendorOption= */
	SendVendorOption?: 'uint8' | 'uint16' | 'uint32' | 'ipv4address' | 'ipv6address' | 'string' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UserClass= */
	UserClass?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VendorClass= */
	VendorClass?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrefixDelegationHint= */
	PrefixDelegationHint?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RapidCommit= */
	RapidCommit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseAddress= */
	UseAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDelegatedPrefix= */
	UseDelegatedPrefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	UseDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	UseNTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	UseHostname?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	UseDomains?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	NetLabel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	SendRelease?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#WithoutRA= */
	WithoutRA?: 'no' | 'solicit' | 'information-request' | string;
}

export const networkDhcpv6_SectionOptionsFields: readonly string[] = [
	'MUDURL',
	'IAID',
	'DUIDType',
	'DUIDRawData',
	'RequestOptions',
	'SendOption',
	'SendVendorOption',
	'UserClass',
	'VendorClass',
	'PrefixDelegationHint',
	'RapidCommit',
	'UseAddress',
	'UseDelegatedPrefix',
	'UseDNS',
	'UseNTP',
	'UseHostname',
	'UseDomains',
	'NetLabel',
	'SendRelease',
	'WithoutRA',
];

export interface INetworkDhcpprefixdelegationSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UplinkInterface= */
	UplinkInterface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SubnetId= */
	SubnetId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Announce= */
	Announce?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Assign= */
	Assign?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Token= */
	Token?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ManageTemporaryAddress= */
	ManageTemporaryAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel= */
	NetLabel?: MaybeArray<string>;
}

export const networkDhcpprefixdelegationFields: readonly string[] = [
	'UplinkInterface',
	'SubnetId',
	'Announce',
	'Assign',
	'Token',
	'ManageTemporaryAddress',
	'RouteMetric',
	'NetLabel',
];

export interface INetworkIpv6acceptra_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Token= */
	Token?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDNS= */
	UseDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseDomains= */
	UseDomains?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteTable= */
	RouteTable?:
		| 'predefined'
		| 'names'
		| 'default'
		| 'main'
		| 'local'
		| 'names'
		| 'defined'
		| 'in'
		| 'RouteTable='
		| 'in'
		| 'networkd'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuickAck= */
	QuickAck?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseMTU= */
	UseMTU?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseGateway= */
	UseGateway?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseRoutePrefix= */
	UseRoutePrefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseAutonomousPrefix= */
	UseAutonomousPrefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseOnLinkPrefix= */
	UseOnLinkPrefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterDenyList= */
	RouterDenyList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterAllowList= */
	RouterAllowList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrefixDenyList= */
	PrefixDenyList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PrefixAllowList= */
	PrefixAllowList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteDenyList= */
	RouteDenyList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteAllowList= */
	RouteAllowList?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DHCPv6Client= */
	DHCPv6Client?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NetLabel= */
	NetLabel?: MaybeArray<string>;
}

export const networkIpv6acceptra_SectionOptionsFields: readonly string[] = [
	'Token',
	'UseDNS',
	'UseDomains',
	'RouteTable',
	'RouteMetric',
	'QuickAck',
	'UseMTU',
	'UseGateway',
	'UseRoutePrefix',
	'UseAutonomousPrefix',
	'UseOnLinkPrefix',
	'RouterDenyList',
	'RouterAllowList',
	'PrefixDenyList',
	'PrefixAllowList',
	'RouteDenyList',
	'RouteAllowList',
	'DHCPv6Client',
	'NetLabel',
];

export interface INetworkDhcpserverSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ServerAddress= */
	ServerAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PoolOffset= */
	PoolOffset?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PoolOffset= */
	PoolSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultLeaseTimeSec= */
	DefaultLeaseTimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultLeaseTimeSec= */
	MaxLeaseTimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UplinkInterface= */
	UplinkInterface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS= */
	EmitDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS= */
	DNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	EmitNTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	NTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	EmitSIP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	SIP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	EmitPOP3?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	POP3?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	EmitSMTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	SMTP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	EmitLPR?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitNTP= */
	LPR?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitRouter= */
	EmitRouter?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitRouter= */
	Router?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitTimezone= */
	EmitTimezone?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitTimezone= */
	Timezone?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BootServerAddress= */
	BootServerAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BootServerName= */
	BootServerName?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BootFilename= */
	BootFilename?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendOption= */
	SendOption?: 'uint8' | 'uint16' | 'uint32' | 'ipv4address' | 'ipv6address' | 'string' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SendVendorOption= */
	SendVendorOption?: 'uint8' | 'uint16' | 'uint32' | 'ipv4address' | 'string' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BindToInterface= */
	BindToInterface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RelayTarget= */
	RelayTarget?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RelayAgentCircuitId= */
	RelayAgentCircuitId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RelayAgentRemoteId= */
	RelayAgentRemoteId?: MaybeArray<string>;
}

export const networkDhcpserverFields: readonly string[] = [
	'ServerAddress',
	'PoolOffset',
	'PoolSize',
	'DefaultLeaseTimeSec',
	'MaxLeaseTimeSec',
	'UplinkInterface',
	'EmitDNS',
	'DNS',
	'EmitNTP',
	'NTP',
	'EmitSIP',
	'SIP',
	'EmitPOP3',
	'POP3',
	'EmitSMTP',
	'SMTP',
	'EmitLPR',
	'LPR',
	'EmitRouter',
	'Router',
	'EmitTimezone',
	'Timezone',
	'BootServerAddress',
	'BootServerName',
	'BootFilename',
	'SendOption',
	'SendVendorOption',
	'BindToInterface',
	'RelayTarget',
	'RelayAgentCircuitId',
	'RelayAgentRemoteId',
];

export interface INetworkDhcpserverstaticleaseSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Address= */
	Address?: MaybeArray<string>;
}

export const networkDhcpserverstaticleaseFields: readonly string[] = ['MACAddress', 'Address'];

export interface INetworkIpv6sendra_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Managed= */
	Managed?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Managed= */
	OtherInformation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterLifetimeSec= */
	RouterLifetimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouterPreference= */
	RouterPreference?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UplinkInterface= */
	UplinkInterface?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS= */
	EmitDNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDNS= */
	DNS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDomains= */
	EmitDomains?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EmitDomains= */
	Domains?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DNSLifetimeSec= */
	DNSLifetimeSec?: MaybeArray<string>;
}

export const networkIpv6sendra_SectionOptionsFields: readonly string[] = [
	'Managed',
	'OtherInformation',
	'RouterLifetimeSec',
	'RouterPreference',
	'UplinkInterface',
	'EmitDNS',
	'DNS',
	'EmitDomains',
	'Domains',
	'DNSLifetimeSec',
];

export interface INetworkIpv6prefix_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AddressAutoconfiguration= */
	AddressAutoconfiguration?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AddressAutoconfiguration= */
	OnLink?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Prefix= */
	Prefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredLifetimeSec= */
	PreferredLifetimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PreferredLifetimeSec= */
	ValidLifetimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Assign= */
	Assign?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Token= */
	Token?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
}

export const networkIpv6prefix_SectionOptionsFields: readonly string[] = [
	'AddressAutoconfiguration',
	'OnLink',
	'Prefix',
	'PreferredLifetimeSec',
	'ValidLifetimeSec',
	'Assign',
	'Token',
	'RouteMetric',
];

export interface INetworkIpv6routeprefix_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Route= */
	Route?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LifetimeSec= */
	LifetimeSec?: MaybeArray<string>;
}

export const networkIpv6routeprefix_SectionOptionsFields: readonly string[] = ['Route', 'LifetimeSec'];

export interface INetworkBridgeSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UnicastFlood= */
	UnicastFlood?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastFlood= */
	MulticastFlood?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastToUnicast= */
	MulticastToUnicast?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NeighborSuppression= */
	NeighborSuppression?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Learning= */
	Learning?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#HairPin= */
	HairPin?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Isolated= */
	Isolated?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseBPDU= */
	UseBPDU?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FastLeave= */
	FastLeave?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AllowPortToBeRoot= */
	AllowPortToBeRoot?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ProxyARP= */
	ProxyARP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ProxyARPWiFi= */
	ProxyARPWiFi?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastRouter= */
	MulticastRouter?:
		| 'no'
		| 'to'
		| 'disable'
		| 'multicast'
		| 'routers'
		| 'on'
		| 'this'
		| 'port'
		| 'query'
		| 'to'
		| 'let'
		| 'the'
		| 'system'
		| 'detect'
		| 'the'
		| 'presence'
		| 'of'
		| 'routers'
		| 'permanent'
		| 'to'
		| 'permanently'
		| 'enable'
		| 'multicast'
		| 'traffic'
		| 'forwarding'
		| 'on'
		| 'this'
		| 'port'
		| 'temporary'
		| 'to'
		| 'enable'
		| 'multicast'
		| 'routers'
		| 'temporarily'
		| 'on'
		| 'this'
		| 'port'
		| 'not'
		| 'depending'
		| 'on'
		| 'incoming'
		| 'queries'
		| string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Cost= */
	Cost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Priority= */
	Priority?: MaybeArray<string>;
}

export const networkBridgeFields: readonly string[] = [
	'UnicastFlood',
	'MulticastFlood',
	'MulticastToUnicast',
	'NeighborSuppression',
	'Learning',
	'HairPin',
	'Isolated',
	'UseBPDU',
	'FastLeave',
	'AllowPortToBeRoot',
	'ProxyARP',
	'ProxyARPWiFi',
	'MulticastRouter',
	'Cost',
	'Priority',
];

export interface INetworkBridgefdbSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Destination= */
	Destination?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANId= */
	VLANId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VNI= */
	VNI?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AssociatedWith= */
	AssociatedWith?: 'use' | 'self' | 'master' | 'router' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OutgoingInterface= */
	OutgoingInterface?: MaybeArray<string>;
}

export const networkBridgefdbFields: readonly string[] = [
	'MACAddress',
	'Destination',
	'VLANId',
	'VNI',
	'AssociatedWith',
	'OutgoingInterface',
];

export interface INetworkBridgemdbSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MulticastGroupAddress= */
	MulticastGroupAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLANId= */
	VLANId?: MaybeArray<string>;
}

export const networkBridgemdbFields: readonly string[] = ['MulticastGroupAddress', 'VLANId'];

export interface INetworkLldpSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MUDURL= */
	MUDURL?: MaybeArray<string>;
}

export const networkLldpFields: readonly string[] = ['MUDURL'];

export interface INetworkCanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BitRate= */
	BitRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SamplePoint= */
	SamplePoint?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec= */
	TimeQuantaNSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec= */
	PropagationSegment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec= */
	PhaseBufferSegment1?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec= */
	PhaseBufferSegment2?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TimeQuantaNSec= */
	SyncJumpWidth?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataBitRate= */
	DataBitRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataBitRate= */
	DataSamplePoint?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec= */
	DataTimeQuantaNSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec= */
	DataPropagationSegment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec= */
	DataPhaseBufferSegment1?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec= */
	DataPhaseBufferSegment2?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DataTimeQuantaNSec= */
	DataSyncJumpWidth?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FDMode= */
	FDMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FDNonISO= */
	FDNonISO?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RestartSec= */
	RestartSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Termination= */
	Termination?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TripleSampling= */
	TripleSampling?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BusErrorReporting= */
	BusErrorReporting?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ListenOnly= */
	ListenOnly?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Loopback= */
	Loopback?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OneShot= */
	OneShot?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PresumeAck= */
	PresumeAck?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassicDataLengthCode= */
	ClassicDataLengthCode?: MaybeArray<string>;
}

export const networkCanFields: readonly string[] = [
	'BitRate',
	'SamplePoint',
	'TimeQuantaNSec',
	'PropagationSegment',
	'PhaseBufferSegment1',
	'PhaseBufferSegment2',
	'SyncJumpWidth',
	'DataBitRate',
	'DataSamplePoint',
	'DataTimeQuantaNSec',
	'DataPropagationSegment',
	'DataPhaseBufferSegment1',
	'DataPhaseBufferSegment2',
	'DataSyncJumpWidth',
	'FDMode',
	'FDNonISO',
	'RestartSec',
	'Termination',
	'TripleSampling',
	'BusErrorReporting',
	'ListenOnly',
	'Loopback',
	'OneShot',
	'PresumeAck',
	'ClassicDataLengthCode',
];

export interface INetworkIpoibSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Mode= */
	Mode?: 'the' | 'special' | 'values' | 'datagram' | 'connected' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IgnoreUserspaceMulticastGroup= */
	IgnoreUserspaceMulticastGroup?: MaybeArray<string>;
}

export const networkIpoibFields: readonly string[] = ['Mode', 'IgnoreUserspaceMulticastGroup'];

export interface INetworkQdiscSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'clsact' | 'ingress' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
}

export const networkQdiscFields: readonly string[] = ['Parent', 'Handle'];

export interface INetworkNetworkemulatorSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DelaySec= */
	DelaySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DelayJitterSec= */
	DelayJitterSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LossRate= */
	LossRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DuplicateRate= */
	DuplicateRate?: MaybeArray<string>;
}

export const networkNetworkemulatorFields: readonly string[] = [
	'Parent',
	'Handle',
	'DelaySec',
	'DelayJitterSec',
	'PacketLimit',
	'LossRate',
	'DuplicateRate',
];

export interface INetworkTokenbucketfilterSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LatencySec= */
	LatencySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LimitBytes= */
	LimitBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BurstBytes= */
	BurstBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Rate= */
	Rate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MPUBytes= */
	MPUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PeakRate= */
	PeakRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes= */
	MTUBytes?: MaybeArray<string>;
}

export const networkTokenbucketfilterFields: readonly string[] = [
	'Parent',
	'Handle',
	'LatencySec',
	'LimitBytes',
	'BurstBytes',
	'Rate',
	'MPUBytes',
	'PeakRate',
	'MTUBytes',
];

export interface INetworkPieSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
}

export const networkPieFields: readonly string[] = ['Parent', 'Handle', 'PacketLimit'];

export interface INetworkFlowqueuepieSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
}

export const networkFlowqueuepieFields: readonly string[] = ['Parent', 'Handle', 'PacketLimit'];

export interface INetworkStochasticfairblueSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
}

export const networkStochasticfairblueFields: readonly string[] = ['Parent', 'Handle', 'PacketLimit'];

export interface INetworkStochasticfairnessqueueingSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PerturbPeriodSec= */
	PerturbPeriodSec?: MaybeArray<string>;
}

export const networkStochasticfairnessqueueingFields: readonly string[] = ['Parent', 'Handle', 'PerturbPeriodSec'];

export interface INetworkBfifoSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#LimitBytes= */
	LimitBytes?: MaybeArray<string>;
}

export const networkBfifoFields: readonly string[] = ['Parent', 'Handle', 'LimitBytes'];

export interface INetworkPfifoSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
}

export const networkPfifoFields: readonly string[] = ['Parent', 'Handle', 'PacketLimit'];

export interface INetworkPfifoheaddropSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
}

export const networkPfifoheaddropFields: readonly string[] = ['Parent', 'Handle', 'PacketLimit'];

export interface INetworkPfifofastSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
}

export const networkPfifofastFields: readonly string[] = ['Parent', 'Handle'];

export interface INetworkCakeSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Bandwidth= */
	Bandwidth?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AutoRateIngress= */
	AutoRateIngress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OverheadBytes= */
	OverheadBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MPUBytes= */
	MPUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CompensationMode= */
	CompensationMode?: 'none' | 'atm' | 'ptm' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#UseRawPacketSize= */
	UseRawPacketSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FlowIsolationMode= */
	FlowIsolationMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#NAT= */
	NAT?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PriorityQueueingPreset= */
	PriorityQueueingPreset?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FirewallMark= */
	FirewallMark?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Wash= */
	Wash?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#SplitGSO= */
	SplitGSO?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RTTSec= */
	RTTSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#AckFilter= */
	AckFilter?: MaybeArray<string>;
}

export const networkCakeFields: readonly string[] = [
	'Parent',
	'Handle',
	'Bandwidth',
	'AutoRateIngress',
	'OverheadBytes',
	'MPUBytes',
	'CompensationMode',
	'UseRawPacketSize',
	'FlowIsolationMode',
	'NAT',
	'PriorityQueueingPreset',
	'FirewallMark',
	'Wash',
	'SplitGSO',
	'RTTSec',
	'AckFilter',
];

export interface INetworkControlleddelaySection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TargetSec= */
	TargetSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IntervalSec= */
	IntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ECN= */
	ECN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CEThresholdSec= */
	CEThresholdSec?: MaybeArray<string>;
}

export const networkControlleddelayFields: readonly string[] = [
	'Parent',
	'Handle',
	'PacketLimit',
	'TargetSec',
	'IntervalSec',
	'ECN',
	'CEThresholdSec',
];

export interface INetworkDeficitroundrobinschedulerSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
}

export const networkDeficitroundrobinschedulerFields: readonly string[] = ['Parent', 'Handle'];

export interface INetworkDeficitroundrobinschedulerclassSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'a' | 'qdisc' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassId= */
	ClassId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes= */
	QuantumBytes?: MaybeArray<string>;
}

export const networkDeficitroundrobinschedulerclassFields: readonly string[] = ['Parent', 'ClassId', 'QuantumBytes'];

export interface INetworkEnhancedtransmissionselectionSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Bands= */
	Bands?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#StrictBands= */
	StrictBands?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes= */
	QuantumBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PriorityMap= */
	PriorityMap?: MaybeArray<string>;
}

export const networkEnhancedtransmissionselectionFields: readonly string[] = [
	'Parent',
	'Handle',
	'Bands',
	'StrictBands',
	'QuantumBytes',
	'PriorityMap',
];

export interface INetworkGenericrandomearlydetectionSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VirtualQueues= */
	VirtualQueues?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultVirtualQueue= */
	DefaultVirtualQueue?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#GenericRIO= */
	GenericRIO?: MaybeArray<string>;
}

export const networkGenericrandomearlydetectionFields: readonly string[] = [
	'Parent',
	'Handle',
	'VirtualQueues',
	'DefaultVirtualQueue',
	'GenericRIO',
];

export interface INetworkFairqueueingcontrolleddelaySection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MemoryLimitBytes= */
	MemoryLimitBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Flows= */
	Flows?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#TargetSec= */
	TargetSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#IntervalSec= */
	IntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes= */
	QuantumBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ECN= */
	ECN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CEThresholdSec= */
	CEThresholdSec?: MaybeArray<string>;
}

export const networkFairqueueingcontrolleddelayFields: readonly string[] = [
	'Parent',
	'Handle',
	'PacketLimit',
	'MemoryLimitBytes',
	'Flows',
	'TargetSec',
	'IntervalSec',
	'QuantumBytes',
	'ECN',
	'CEThresholdSec',
];

export interface INetworkFairqueueingSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#FlowLimit= */
	FlowLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes= */
	QuantumBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#InitialQuantumBytes= */
	InitialQuantumBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MaximumRate= */
	MaximumRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Buckets= */
	Buckets?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OrphanMask= */
	OrphanMask?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Pacing= */
	Pacing?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CEThresholdSec= */
	CEThresholdSec?: MaybeArray<string>;
}

export const networkFairqueueingFields: readonly string[] = [
	'Parent',
	'Handle',
	'PacketLimit',
	'FlowLimit',
	'QuantumBytes',
	'InitialQuantumBytes',
	'MaximumRate',
	'Buckets',
	'OrphanMask',
	'Pacing',
	'CEThresholdSec',
];

export interface INetworkTriviallinkequalizerSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Id= */
	Id?: MaybeArray<string>;
}

export const networkTriviallinkequalizerFields: readonly string[] = ['Parent', 'Handle', 'Id'];

export interface INetworkHierarchytokenbucketSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#DefaultClass= */
	DefaultClass?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#RateToQuantum= */
	RateToQuantum?: MaybeArray<string>;
}

export const networkHierarchytokenbucketFields: readonly string[] = [
	'Parent',
	'Handle',
	'DefaultClass',
	'RateToQuantum',
];

export interface INetworkHierarchytokenbucketclassSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'a' | 'qdisc' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassId= */
	ClassId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Priority= */
	Priority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#QuantumBytes= */
	QuantumBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MTUBytes= */
	MTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#OverheadBytes= */
	OverheadBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Rate= */
	Rate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CeilRate= */
	CeilRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#BufferBytes= */
	BufferBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#CeilBufferBytes= */
	CeilBufferBytes?: MaybeArray<string>;
}

export const networkHierarchytokenbucketclassFields: readonly string[] = [
	'Parent',
	'ClassId',
	'Priority',
	'QuantumBytes',
	'MTUBytes',
	'OverheadBytes',
	'Rate',
	'CeilRate',
	'BufferBytes',
	'CeilBufferBytes',
];

export interface INetworkHeavyhitterfilterSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PacketLimit= */
	PacketLimit?: MaybeArray<string>;
}

export const networkHeavyhitterfilterFields: readonly string[] = ['Parent', 'Handle', 'PacketLimit'];

export interface INetworkQuickfairqueueingSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'clsact' | 'ingress' | 'a' | 'class' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Handle= */
	Handle?: MaybeArray<string>;
}

export const networkQuickfairqueueingFields: readonly string[] = ['Parent', 'Handle'];

export interface INetworkQuickfairqueueingclassSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Parent= */
	Parent?: 'root' | 'a' | 'qdisc' | 'identifier' | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#ClassId= */
	ClassId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#Weight= */
	Weight?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#MaxPacketBytes= */
	MaxPacketBytes?: MaybeArray<string>;
}

export const networkQuickfairqueueingclassFields: readonly string[] = ['Parent', 'ClassId', 'Weight', 'MaxPacketBytes'];

export interface INetworkBridgevlanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#VLAN= */
	VLAN?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#EgressUntagged= */
	EgressUntagged?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.network.html#PVID= */
	PVID?: MaybeArray<string>;
}

export const networkBridgevlanFields: readonly string[] = ['VLAN', 'EgressUntagged', 'PVID'];

export type __INetworkAll = INetworkMatchSection &
	INetworkLinkSection &
	INetworkSrIov_SectionOptionsOptions &
	INetworkNetworkSection &
	INetworkAddressSection &
	INetworkNeighborSection &
	INetworkIpv6addresslabel_SectionOptionsOptions &
	INetworkRoutingpolicyruleSection &
	INetworkNexthopSection &
	INetworkRouteSection &
	INetworkDhcpv4_SectionOptionsOptions &
	INetworkDhcpv6_SectionOptionsOptions &
	INetworkDhcpprefixdelegationSection &
	INetworkIpv6acceptra_SectionOptionsOptions &
	INetworkDhcpserverSection &
	INetworkDhcpserverstaticleaseSection &
	INetworkIpv6sendra_SectionOptionsOptions &
	INetworkIpv6prefix_SectionOptionsOptions &
	INetworkIpv6routeprefix_SectionOptionsOptions &
	INetworkBridgeSection &
	INetworkBridgefdbSection &
	INetworkBridgemdbSection &
	INetworkLldpSection &
	INetworkCanSection &
	INetworkIpoibSection &
	INetworkQdiscSection &
	INetworkNetworkemulatorSection &
	INetworkTokenbucketfilterSection &
	INetworkPieSection &
	INetworkFlowqueuepieSection &
	INetworkStochasticfairblueSection &
	INetworkStochasticfairnessqueueingSection &
	INetworkBfifoSection &
	INetworkPfifoSection &
	INetworkPfifoheaddropSection &
	INetworkPfifofastSection &
	INetworkCakeSection &
	INetworkControlleddelaySection &
	INetworkDeficitroundrobinschedulerSection &
	INetworkDeficitroundrobinschedulerclassSection &
	INetworkEnhancedtransmissionselectionSection &
	INetworkGenericrandomearlydetectionSection &
	INetworkFairqueueingcontrolleddelaySection &
	INetworkFairqueueingSection &
	INetworkTriviallinkequalizerSection &
	INetworkHierarchytokenbucketSection &
	INetworkHierarchytokenbucketclassSection &
	INetworkHeavyhitterfilterSection &
	INetworkQuickfairqueueingSection &
	INetworkQuickfairqueueingclassSection &
	INetworkBridgevlanSection;
