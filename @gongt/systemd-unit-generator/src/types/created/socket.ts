
// @ts-ignore
type MaybeArray<T> = T | T[];
// @ts-ignore
type BooleanType = 'true' | 'false' | 'yes' | 'no' | '1' | '0' | 'on' | 'off';

export interface ISocketSection {
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenStream= */
	ListenStream?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenStream= */
	ListenDatagram?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenStream= */
	ListenSequentialPacket?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenFIFO= */
	ListenFIFO?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenSpecial= */
	ListenSpecial?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenNetlink= */
	ListenNetlink?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenMessageQueue= */
	ListenMessageQueue?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenUSBFunction= */
	ListenUSBFunction?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketProtocol= */
	SocketProtocol?: "udplite" | "sctp" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#BindIPv6Only= */
	BindIPv6Only?: "default" | "both" | "ipv6-only" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Backlog= */
	Backlog?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#BindToDevice= */
	BindToDevice?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketUser= */
	SocketUser?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketUser= */
	SocketGroup?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketMode= */
	SocketMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#DirectoryMode= */
	DirectoryMode?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Accept= */
	Accept?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Writable= */
	Writable?: MaybeArray<BooleanType>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#FlushPending= */
	FlushPending?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MaxConnections= */
	MaxConnections?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MaxConnectionsPerSource= */
	MaxConnectionsPerSource?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAlive= */
	KeepAlive?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAliveTimeSec= */
	KeepAliveTimeSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAliveIntervalSec= */
	KeepAliveIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAliveProbes= */
	KeepAliveProbes?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#NoDelay= */
	NoDelay?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Priority= */
	Priority?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#DeferAcceptSec= */
	DeferAcceptSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ReceiveBuffer= */
	ReceiveBuffer?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ReceiveBuffer= */
	SendBuffer?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#IPTOS= */
	IPTOS?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#IPTTL= */
	IPTTL?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Mark= */
	Mark?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ReusePort= */
	ReusePort?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SmackLabel= */
	SmackLabel?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SmackLabel= */
	SmackLabelIPIn?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SmackLabel= */
	SmackLabelIPOut?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SELinuxContextFromNet= */
	SELinuxContextFromNet?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PipeSize= */
	PipeSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MessageQueueMaxMessages= */
	MessageQueueMaxMessages?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MessageQueueMaxMessages= */
	MessageQueueMessageSize?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#FreeBind= */
	FreeBind?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Transparent= */
	Transparent?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Broadcast= */
	Broadcast?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PassCredentials= */
	PassCredentials?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PassSecurity= */
	PassSecurity?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PassPacketInfo= */
	PassPacketInfo?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Timestamping= */
	Timestamping?: "off" | "us" | string;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TCPCongestion= */
	TCPCongestion?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStartPre= */
	ExecStartPre?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStartPre= */
	ExecStartPost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStopPre= */
	ExecStopPre?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStopPre= */
	ExecStopPost?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TimeoutSec= */
	TimeoutSec?: string | number;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Service= */
	Service?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#RemoveOnStop= */
	RemoveOnStop?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Symlinks= */
	Symlinks?: string[];
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#FileDescriptorName= */
	FileDescriptorName?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TriggerLimitIntervalSec= */
	TriggerLimitIntervalSec?: MaybeArray<string>;
	/** @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TriggerLimitIntervalSec= */
	TriggerLimitBurst?: MaybeArray<string>;
}

export const socketFields: readonly string[] = ["ListenStream","ListenDatagram","ListenSequentialPacket","ListenFIFO","ListenSpecial","ListenNetlink","ListenMessageQueue","ListenUSBFunction","SocketProtocol","BindIPv6Only","Backlog","BindToDevice","SocketUser","SocketGroup","SocketMode","DirectoryMode","Accept","Writable","FlushPending","MaxConnections","MaxConnectionsPerSource","KeepAlive","KeepAliveTimeSec","KeepAliveIntervalSec","KeepAliveProbes","NoDelay","Priority","DeferAcceptSec","ReceiveBuffer","SendBuffer","IPTOS","IPTTL","Mark","ReusePort","SmackLabel","SmackLabelIPIn","SmackLabelIPOut","SELinuxContextFromNet","PipeSize","MessageQueueMaxMessages","MessageQueueMessageSize","FreeBind","Transparent","Broadcast","PassCredentials","PassSecurity","PassPacketInfo","Timestamping","TCPCongestion","ExecStartPre","ExecStartPost","ExecStopPre","ExecStopPost","TimeoutSec","Service","RemoveOnStop","Symlinks","FileDescriptorName","TriggerLimitIntervalSec","TriggerLimitBurst"];


