// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface ILinkMatchSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#PermanentMACAddress= */
	PermanentMACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Path= */
	Path?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Driver= */
	Driver?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Type= */
	Type?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Kind= */
	Kind?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Property= */
	Property?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#OriginalName= */
	OriginalName?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Host= */
	Host?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Virtualization= */
	Virtualization?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#KernelCommandLine= */
	KernelCommandLine?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#KernelVersion= */
	KernelVersion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Credential= */
	Credential?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Architecture= */
	Architecture?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Firmware= */
	Firmware?: MaybeArray<string>;
}

export const linkMatchFields: readonly string[] = ['MACAddress', 'PermanentMACAddress', 'Path', 'Driver', 'Type', 'Kind', 'Property', 'OriginalName', 'Host', 'Virtualization', 'KernelCommandLine', 'KernelVersion', 'Credential', 'Architecture', 'Firmware'];

export interface ILinkLinkSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Description= */
	Description?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Alias= */
	Alias?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddressPolicy= */
	MACAddressPolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#NamePolicy= */
	NamePolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Name= */
	Name?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AlternativeNamesPolicy= */
	AlternativeNamesPolicy?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AlternativeName= */
	AlternativeName?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitQueues= */
	TransmitQueues?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveQueues= */
	ReceiveQueues?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitQueueLength= */
	TransmitQueueLength?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MTUBytes= */
	MTUBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#BitsPerSecond= */
	BitsPerSecond?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Duplex= */
	Duplex?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AutoNegotiation= */
	AutoNegotiation?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#WakeOnLan= */
	WakeOnLan?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#WakeOnLanPassword= */
	WakeOnLanPassword?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Port= */
	Port?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Advertise= */
	Advertise?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveChecksumOffload= */
	ReceiveChecksumOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitChecksumOffload= */
	TransmitChecksumOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TCPSegmentationOffload= */
	TCPSegmentationOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TCP6SegmentationOffload= */
	TCP6SegmentationOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericSegmentationOffload= */
	GenericSegmentationOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericReceiveOffload= */
	GenericReceiveOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericReceiveOffloadHardware= */
	GenericReceiveOffloadHardware?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#LargeReceiveOffload= */
	LargeReceiveOffload?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveVLANCTAGHardwareAcceleration= */
	ReceiveVLANCTAGHardwareAcceleration?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitVLANCTAGHardwareAcceleration= */
	TransmitVLANCTAGHardwareAcceleration?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#ReceiveVLANCTAGFilter= */
	ReceiveVLANCTAGFilter?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TransmitVLANSTAGHardwareAcceleration= */
	TransmitVLANSTAGHardwareAcceleration?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#NTupleFilter= */
	NTupleFilter?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels= */
	RxChannels?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels= */
	TxChannels?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels= */
	OtherChannels?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxChannels= */
	CombinedChannels?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize= */
	RxBufferSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize= */
	RxMiniBufferSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize= */
	RxJumboBufferSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxBufferSize= */
	TxBufferSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxFlowControl= */
	RxFlowControl?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TxFlowControl= */
	TxFlowControl?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#AutoNegotiationFlowControl= */
	AutoNegotiationFlowControl?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericSegmentOffloadMaxBytes= */
	GenericSegmentOffloadMaxBytes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#GenericSegmentOffloadMaxSegments= */
	GenericSegmentOffloadMaxSegments?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#UseAdaptiveRxCoalesce= */
	UseAdaptiveRxCoalesce?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#UseAdaptiveRxCoalesce= */
	UseAdaptiveTxCoalesce?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	RxCoalesceSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	RxCoalesceIrqSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	RxCoalesceLowSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	RxCoalesceHighSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	TxCoalesceSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	TxCoalesceIrqSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	TxCoalesceLowSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxCoalesceSec= */
	TxCoalesceHighSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	RxMaxCoalescedFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	RxMaxCoalescedIrqFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	RxMaxCoalescedLowFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	RxMaxCoalescedHighFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	TxMaxCoalescedFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	TxMaxCoalescedIrqFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#RxMaxCoalescedFrames= */
	TxMaxCoalescedLowFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#TxMaxCoalescedHighFrames= */
	TxMaxCoalescedHighFrames?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#CoalescePacketRateLow= */
	CoalescePacketRateLow?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#CoalescePacketRateLow= */
	CoalescePacketRateHigh?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#CoalescePacketRateSampleIntervalSec= */
	CoalescePacketRateSampleIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#StatisticsBlockCoalesceSec= */
	StatisticsBlockCoalesceSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MDI= */
	MDI?: 'the' | 'following' | 'words:' | 'straight' | 'auto' | string;
}

export const linkLinkFields: readonly string[] = [
	'Description',
	'Alias',
	'MACAddressPolicy',
	'MACAddress',
	'NamePolicy',
	'Name',
	'AlternativeNamesPolicy',
	'AlternativeName',
	'TransmitQueues',
	'ReceiveQueues',
	'TransmitQueueLength',
	'MTUBytes',
	'BitsPerSecond',
	'Duplex',
	'AutoNegotiation',
	'WakeOnLan',
	'WakeOnLanPassword',
	'Port',
	'Advertise',
	'ReceiveChecksumOffload',
	'TransmitChecksumOffload',
	'TCPSegmentationOffload',
	'TCP6SegmentationOffload',
	'GenericSegmentationOffload',
	'GenericReceiveOffload',
	'GenericReceiveOffloadHardware',
	'LargeReceiveOffload',
	'ReceiveVLANCTAGHardwareAcceleration',
	'TransmitVLANCTAGHardwareAcceleration',
	'ReceiveVLANCTAGFilter',
	'TransmitVLANSTAGHardwareAcceleration',
	'NTupleFilter',
	'RxChannels',
	'TxChannels',
	'OtherChannels',
	'CombinedChannels',
	'RxBufferSize',
	'RxMiniBufferSize',
	'RxJumboBufferSize',
	'TxBufferSize',
	'RxFlowControl',
	'TxFlowControl',
	'AutoNegotiationFlowControl',
	'GenericSegmentOffloadMaxBytes',
	'GenericSegmentOffloadMaxSegments',
	'UseAdaptiveRxCoalesce',
	'UseAdaptiveTxCoalesce',
	'RxCoalesceSec',
	'RxCoalesceIrqSec',
	'RxCoalesceLowSec',
	'RxCoalesceHighSec',
	'TxCoalesceSec',
	'TxCoalesceIrqSec',
	'TxCoalesceLowSec',
	'TxCoalesceHighSec',
	'RxMaxCoalescedFrames',
	'RxMaxCoalescedIrqFrames',
	'RxMaxCoalescedLowFrames',
	'RxMaxCoalescedHighFrames',
	'TxMaxCoalescedFrames',
	'TxMaxCoalescedIrqFrames',
	'TxMaxCoalescedLowFrames',
	'TxMaxCoalescedHighFrames',
	'CoalescePacketRateLow',
	'CoalescePacketRateHigh',
	'CoalescePacketRateSampleIntervalSec',
	'StatisticsBlockCoalesceSec',
	'MDI',
];

export interface ILinkSrIov_SectionOptionsOptions {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#VirtualFunction= */
	VirtualFunction?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#VLANId= */
	VLANId?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#QualityOfService= */
	QualityOfService?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#VLANProtocol= */
	VLANProtocol?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACSpoofCheck= */
	MACSpoofCheck?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#QueryReceiveSideScaling= */
	QueryReceiveSideScaling?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#Trust= */
	Trust?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#LinkState= */
	LinkState?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.link.html#MACAddress= */
	MACAddress?: MaybeArray<string>;
}

export const linkSrIov_SectionOptionsFields: readonly string[] = ['VirtualFunction', 'VLANId', 'QualityOfService', 'VLANProtocol', 'MACSpoofCheck', 'QueryReceiveSideScaling', 'Trust', 'LinkState', 'MACAddress'];

export type __ILinkAll = ILinkMatchSection & ILinkLinkSection & ILinkSrIov_SectionOptionsOptions;
