
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface INetdevMatchSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Host= */
	Host?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Virtualization= */
	Virtualization?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KernelCommandLine= */
	KernelCommandLine?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KernelVersion= */
	KernelVersion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Credential= */
	Credential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Architecture= */
	Architecture?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Firmware= */
	Firmware?: MaybeArray<string>;
}

export const netdevMatchFields: readonly string[] = ["Host","Virtualization","KernelCommandLine","KernelVersion","Credential","Architecture","Firmware"];

export interface INetdevNetdevSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Description= */
	Description?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Name= */
	Name?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Kind= */
	Kind?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MTUBytes= */
	MTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
}

export const netdevNetdevFields: readonly string[] = ["Description","Name","Kind","MTUBytes","MACAddress"];

export interface INetdevBridgeSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#HelloTimeSec= */
	HelloTimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MaxAgeSec= */
	MaxAgeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ForwardDelaySec= */
	ForwardDelaySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AgeingTimeSec= */
	AgeingTimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Priority= */
	Priority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GroupForwardMask= */
	GroupForwardMask?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DefaultPVID= */
	DefaultPVID?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MulticastQuerier= */
	MulticastQuerier?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MulticastSnooping= */
	MulticastSnooping?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VLANFiltering= */
	VLANFiltering?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VLANProtocol= */
	VLANProtocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#STP= */
	STP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MulticastIGMPVersion= */
	MulticastIGMPVersion?: MaybeArray<string>;
}

export const netdevBridgeFields: readonly string[] = ["HelloTimeSec","MaxAgeSec","ForwardDelaySec","AgeingTimeSec","Priority","GroupForwardMask","DefaultPVID","MulticastQuerier","MulticastSnooping","VLANFiltering","VLANProtocol","STP","MulticastIGMPVersion"];

export interface INetdevVlanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Id= */
	Id?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Protocol= */
	Protocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GVRP= */
	GVRP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MVRP= */
	MVRP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#LooseBinding= */
	LooseBinding?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ReorderHeader= */
	ReorderHeader?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EgressQOSMaps= */
	EgressQOSMaps?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EgressQOSMaps= */
	IngressQOSMaps?: MaybeArray<string>;
}

export const netdevVlanFields: readonly string[] = ["Id","Protocol","GVRP","MVRP","LooseBinding","ReorderHeader","EgressQOSMaps","IngressQOSMaps"];

export interface INetdevMacvlanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode= */
	Mode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#SourceMACAddress= */
	SourceMACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#BroadcastMulticastQueueLength= */
	BroadcastMulticastQueueLength?: MaybeArray<string>;
}

export const netdevMacvlanFields: readonly string[] = ["Mode","SourceMACAddress","BroadcastMulticastQueueLength"];

export interface INetdevIpvlanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode= */
	Mode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Flags= */
	Flags?: MaybeArray<string>;
}

export const netdevIpvlanFields: readonly string[] = ["Mode","Flags"];

export interface INetdevVxlanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VNI= */
	VNI?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote= */
	Remote?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local= */
	Local?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Group= */
	Group?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TOS= */
	TOS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TTL= */
	TTL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MacLearning= */
	MacLearning?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FDBAgeingSec= */
	FDBAgeingSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MaximumFDBEntries= */
	MaximumFDBEntries?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ReduceARPProxy= */
	ReduceARPProxy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#L2MissNotification= */
	L2MissNotification?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#L3MissNotification= */
	L3MissNotification?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteShortCircuit= */
	RouteShortCircuit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPChecksum= */
	UDPChecksum?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumTx= */
	UDP6ZeroChecksumTx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumRx= */
	UDP6ZeroChecksumRx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RemoteChecksumTx= */
	RemoteChecksumTx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RemoteChecksumRx= */
	RemoteChecksumRx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GroupPolicyExtension= */
	GroupPolicyExtension?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GenericProtocolExtension= */
	GenericProtocolExtension?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DestinationPort= */
	DestinationPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PortRange= */
	PortRange?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FlowLabel= */
	FlowLabel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPDoNotFragment= */
	IPDoNotFragment?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Independent= */
	Independent?: MaybeArray<string>;
}

export const netdevVxlanFields: readonly string[] = ["VNI","Remote","Local","Group","TOS","TTL","MacLearning","FDBAgeingSec","MaximumFDBEntries","ReduceARPProxy","L2MissNotification","L3MissNotification","RouteShortCircuit","UDPChecksum","UDP6ZeroChecksumTx","UDP6ZeroChecksumRx","RemoteChecksumTx","RemoteChecksumRx","GroupPolicyExtension","GenericProtocolExtension","DestinationPort","PortRange","FlowLabel","IPDoNotFragment","Independent"];

export interface INetdevGeneveSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Id= */
	Id?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote= */
	Remote?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TOS= */
	TOS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TTL= */
	TTL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPChecksum= */
	UDPChecksum?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumTx= */
	UDP6ZeroChecksumTx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumRx= */
	UDP6ZeroChecksumRx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DestinationPort= */
	DestinationPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FlowLabel= */
	FlowLabel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPDoNotFragment= */
	IPDoNotFragment?: MaybeArray<string>;
}

export const netdevGeneveFields: readonly string[] = ["Id","Remote","TOS","TTL","UDPChecksum","UDP6ZeroChecksumTx","UDP6ZeroChecksumRx","DestinationPort","FlowLabel","IPDoNotFragment"];

export interface INetdevBareudpSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DestinationPort= */
	DestinationPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EtherType= */
	EtherType?: "ipv4" | "ipv6" | "mpls-uc" | "mpls-mc" | string;
}

export const netdevBareudpFields: readonly string[] = ["DestinationPort","EtherType"];

export interface INetdevL2tp_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TunnelId= */
	TunnelId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PeerTunnelId= */
	PeerTunnelId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote= */
	Remote?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local= */
	Local?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EncapsulationType= */
	EncapsulationType?: "udp" | "ip" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPSourcePort= */
	UDPSourcePort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPDestinationPort= */
	UDPDestinationPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDPChecksum= */
	UDPChecksum?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumTx= */
	UDP6ZeroChecksumTx?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UDP6ZeroChecksumRx= */
	UDP6ZeroChecksumRx?: MaybeArray<string>;
}

export const netdevL2tp_SectionOptionsFields: readonly string[] = ["TunnelId","PeerTunnelId","Remote","Local","EncapsulationType","UDPSourcePort","UDPDestinationPort","UDPChecksum","UDP6ZeroChecksumTx","UDP6ZeroChecksumRx"];

export interface INetdevL2tpsession_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Name= */
	Name?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#SessionId= */
	SessionId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PeerSessionId= */
	PeerSessionId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Layer2SpecificHeader= */
	Layer2SpecificHeader?: MaybeArray<string>;
}

export const netdevL2tpsession_SectionOptionsFields: readonly string[] = ["Name","SessionId","PeerSessionId","Layer2SpecificHeader"];

export interface INetdevMacsecSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port= */
	Port?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Encrypt= */
	Encrypt?: MaybeArray<string>;
}

export const netdevMacsecFields: readonly string[] = ["Port","Encrypt"];

export interface INetdevMacsecreceivechannelSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port= */
	Port?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
}

export const netdevMacsecreceivechannelFields: readonly string[] = ["Port","MACAddress"];

export interface INetdevMacsectransmitassociationSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketNumber= */
	PacketNumber?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyId= */
	KeyId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Key= */
	Key?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyFile= */
	KeyFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Activate= */
	Activate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UseForEncoding= */
	UseForEncoding?: MaybeArray<string>;
}

export const netdevMacsectransmitassociationFields: readonly string[] = ["PacketNumber","KeyId","Key","KeyFile","Activate","UseForEncoding"];

export interface INetdevMacsecreceiveassociationSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port= */
	Port?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketNumber= */
	PacketNumber?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyId= */
	KeyId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Key= */
	Key?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeyFile= */
	KeyFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Activate= */
	Activate?: MaybeArray<string>;
}

export const netdevMacsecreceiveassociationFields: readonly string[] = ["Port","MACAddress","PacketNumber","KeyId","Key","KeyFile","Activate"];

export interface INetdevTunnelSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#External= */
	External?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local= */
	Local?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Remote= */
	Remote?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TOS= */
	TOS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TTL= */
	TTL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DiscoverPathMTU= */
	DiscoverPathMTU?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPv6FlowLabel= */
	IPv6FlowLabel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#CopyDSCP= */
	CopyDSCP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#EncapsulationLimit= */
	EncapsulationLimit?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Key= */
	Key?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#InputKey= */
	InputKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#OutputKey= */
	OutputKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode= */
	Mode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Independent= */
	Independent?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AssignToLoopback= */
	AssignToLoopback?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AllowLocalRemote= */
	AllowLocalRemote?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FooOverUDP= */
	FooOverUDP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FOUDestinationPort= */
	FOUDestinationPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FOUSourcePort= */
	FOUSourcePort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Encapsulation= */
	Encapsulation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IPv6RapidDeploymentPrefix= */
	IPv6RapidDeploymentPrefix?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ISATAP= */
	ISATAP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#SerializeTunneledPackets= */
	SerializeTunneledPackets?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANVersion= */
	ERSPANVersion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANIndex= */
	ERSPANIndex?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANDirection= */
	ERSPANDirection?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ERSPANHardwareId= */
	ERSPANHardwareId?: MaybeArray<string>;
}

export const netdevTunnelFields: readonly string[] = ["External","Local","Remote","TOS","TTL","DiscoverPathMTU","IPv6FlowLabel","CopyDSCP","EncapsulationLimit","Key","InputKey","OutputKey","Mode","Independent","AssignToLoopback","AllowLocalRemote","FooOverUDP","FOUDestinationPort","FOUSourcePort","Encapsulation","IPv6RapidDeploymentPrefix","ISATAP","SerializeTunneledPackets","ERSPANVersion","ERSPANIndex","ERSPANDirection","ERSPANHardwareId"];

export interface INetdevFoooverudpSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Encapsulation= */
	Encapsulation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Port= */
	Port?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PeerPort= */
	PeerPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Protocol= */
	Protocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Peer= */
	Peer?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Local= */
	Local?: MaybeArray<string>;
}

export const netdevFoooverudpFields: readonly string[] = ["Encapsulation","Port","PeerPort","Protocol","Peer","Local"];

export interface INetdevPeerSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Name= */
	Name?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
}

export const netdevPeerFields: readonly string[] = ["Name","MACAddress"];

export interface INetdevVxcanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Peer= */
	Peer?: MaybeArray<string>;
}

export const netdevVxcanFields: readonly string[] = ["Peer"];

export interface INetdevTunSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MultiQueue= */
	MultiQueue?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketInfo= */
	PacketInfo?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#VNetHeader= */
	VNetHeader?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#User= */
	User?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Group= */
	Group?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#KeepCarrier= */
	KeepCarrier?: MaybeArray<string>;
}

export const netdevTunFields: readonly string[] = ["MultiQueue","PacketInfo","VNetHeader","User","Group","KeepCarrier"];

export interface INetdevWireguardSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PrivateKey= */
	PrivateKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PrivateKeyFile= */
	PrivateKeyFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ListenPort= */
	ListenPort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FirewallMark= */
	FirewallMark?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteTable= */
	RouteTable?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
}

export const netdevWireguardFields: readonly string[] = ["PrivateKey","PrivateKeyFile","ListenPort","FirewallMark","RouteTable","RouteMetric"];

export interface INetdevWireguardpeerSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PublicKey= */
	PublicKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PresharedKey= */
	PresharedKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PresharedKeyFile= */
	PresharedKeyFile?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AllowedIPs= */
	AllowedIPs?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Endpoint= */
	Endpoint?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PersistentKeepalive= */
	PersistentKeepalive?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteTable= */
	RouteTable?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RouteMetric= */
	RouteMetric?: MaybeArray<string>;
}

export const netdevWireguardpeerFields: readonly string[] = ["PublicKey","PresharedKey","PresharedKeyFile","AllowedIPs","Endpoint","PersistentKeepalive","RouteTable","RouteMetric"];

export interface INetdevBondSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode= */
	Mode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#TransmitHashPolicy= */
	TransmitHashPolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#LACPTransmitRate= */
	LACPTransmitRate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MIIMonitorSec= */
	MIIMonitorSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#UpDelaySec= */
	UpDelaySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DownDelaySec= */
	DownDelaySec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#LearnPacketIntervalSec= */
	LearnPacketIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdSelect= */
	AdSelect?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdActorSystemPriority= */
	AdActorSystemPriority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdUserPortKey= */
	AdUserPortKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AdActorSystem= */
	AdActorSystem?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#FailOverMACPolicy= */
	FailOverMACPolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPValidate= */
	ARPValidate?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPIntervalSec= */
	ARPIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPIPTargets= */
	ARPIPTargets?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ARPAllTargets= */
	ARPAllTargets?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PrimaryReselectPolicy= */
	PrimaryReselectPolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#ResendIGMP= */
	ResendIGMP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PacketsPerSlave= */
	PacketsPerSlave?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GratuitousARP= */
	GratuitousARP?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#AllSlavesActive= */
	AllSlavesActive?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DynamicTransmitLoadBalancing= */
	DynamicTransmitLoadBalancing?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#MinLinks= */
	MinLinks?: MaybeArray<string>;
}

export const netdevBondFields: readonly string[] = ["Mode","TransmitHashPolicy","LACPTransmitRate","MIIMonitorSec","UpDelaySec","DownDelaySec","LearnPacketIntervalSec","AdSelect","AdActorSystemPriority","AdUserPortKey","AdActorSystem","FailOverMACPolicy","ARPValidate","ARPIntervalSec","ARPIPTargets","ARPAllTargets","PrimaryReselectPolicy","ResendIGMP","PacketsPerSlave","GratuitousARP","AllSlavesActive","DynamicTransmitLoadBalancing","MinLinks"];

export interface INetdevXfrmSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#InterfaceId= */
	InterfaceId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Independent= */
	Independent?: MaybeArray<string>;
}

export const netdevXfrmFields: readonly string[] = ["InterfaceId","Independent"];

export interface INetdevVrfSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Table= */
	Table?: MaybeArray<string>;
}

export const netdevVrfFields: readonly string[] = ["Table"];

export interface INetdevBatmanadvancedSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GatewayMode= */
	GatewayMode?: "off" | "server" | "client" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Aggregation= */
	Aggregation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#BridgeLoopAvoidance= */
	BridgeLoopAvoidance?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#DistributedArpTable= */
	DistributedArpTable?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Fragmentation= */
	Fragmentation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#HopPenalty= */
	HopPenalty?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#OriginatorIntervalSec= */
	OriginatorIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GatewayBandwidthDown= */
	GatewayBandwidthDown?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#GatewayBandwidthUp= */
	GatewayBandwidthUp?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#RoutingAlgorithm= */
	RoutingAlgorithm?: MaybeArray<string>;
}

export const netdevBatmanadvancedFields: readonly string[] = ["GatewayMode","Aggregation","BridgeLoopAvoidance","DistributedArpTable","Fragmentation","HopPenalty","OriginatorIntervalSec","GatewayBandwidthDown","GatewayBandwidthUp","RoutingAlgorithm"];

export interface INetdevIpoibSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PartitionKey= */
	PartitionKey?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Mode= */
	Mode?: "the" | "special" | "values" | "datagram" | "connected" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#IgnoreUserspaceMulticastGroup= */
	IgnoreUserspaceMulticastGroup?: MaybeArray<string>;
}

export const netdevIpoibFields: readonly string[] = ["PartitionKey","Mode","IgnoreUserspaceMulticastGroup"];

export interface INetdevWlanSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#PhysicalDevice= */
	PhysicalDevice?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#Type= */
	Type?: "the" | "ad-hoc" | "station" | "ap" | "ap-vlan" | "wds" | "monitor" | "mesh-point" | "p2p-client" | "p2p-go" | "p2p-device" | "ocb" | "nan" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.netdev.html#WDS= */
	WDS?: MaybeArray<string>;
}

export const netdevWlanFields: readonly string[] = ["PhysicalDevice","Type","WDS"];

export type __INetdevAll = INetdevMatchSection & INetdevNetdevSection & INetdevBridgeSection & INetdevVlanSection & INetdevMacvlanSection & INetdevIpvlanSection & INetdevVxlanSection & INetdevGeneveSection & INetdevBareudpSection & INetdevL2tp_SectionOptionsOptions & INetdevL2tpsession_SectionOptionsOptions & INetdevMacsecSection & INetdevMacsecreceivechannelSection & INetdevMacsectransmitassociationSection & INetdevMacsecreceiveassociationSection & INetdevTunnelSection & INetdevFoooverudpSection & INetdevPeerSection & INetdevVxcanSection & INetdevTunSection & INetdevWireguardSection & INetdevWireguardpeerSection & INetdevBondSection & INetdevXfrmSection & INetdevVrfSection & INetdevBatmanadvancedSection & INetdevIpoibSection & INetdevWlanSection;
