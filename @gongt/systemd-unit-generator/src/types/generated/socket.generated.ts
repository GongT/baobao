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
 * Socket unit files may include [Unit] and [Install] sections, which are described in systemd.unit(5).
 *
 * Socket unit files must include a [Socket] section, which carries information about the socket or FIFO it supervises. A number of options that may be used in this
 *
 * section are shared with other unit types. These options are documented in systemd.exec(5) and systemd.kill(5). The options specific to the [Socket] section of socket
 *
 * units are the following:
 *
 */
export interface ISocketOptions {
	/**
	 * Specifies an address to listen on for a stream (SOCK_STREAM), datagram (SOCK_DGRAM), or sequential packet (SOCK_SEQPACKET) socket, respectively. The address can be
	 *
	 * written in various formats:
	 *
	 * If the address starts with a slash ("/"), it is read as file system socket in the AF_UNIX socket family.
	 *
	 * If the address starts with an at symbol ("@"), it is read as abstract namespace socket in the AF_UNIX family. The "@" is replaced with a NUL character before
	 *
	 * binding. For details, see unix(7).
	 *
	 * If the address string is a single number, it is read as port number to listen on via IPv6. Depending on the value of BindIPv6Only= (see below) this might result in
	 *
	 * the service being available via both IPv6 and IPv4 (default) or just via IPv6.
	 *
	 * If the address string is a string in the format "v.w.x.y:z", it is interpreted as IPv4 address v.w.x.y and port z.
	 *
	 * If the address string is a string in the format "[x]:y", it is interpreted as IPv6 address x and port y. An optional interface scope (interface name or number) may
	 *
	 * be specified after a "%" symbol: "[x]:y%dev". Interface scopes are only useful with link-local addresses, because the kernel ignores them in other cases. Note that
	 *
	 * if an address is specified as IPv6, it might still make the service available via IPv4 too, depending on the BindIPv6Only= setting (see below).
	 *
	 * If the address string is a string in the format "vsock:x:y", it is read as CID x on a port y address in the AF_VSOCK family. The CID is a unique 32-bit integer
	 *
	 * identifier in AF_VSOCK analogous to an IP address. Specifying the CID is optional, and may be set to the empty string.
	 *
	 * Note that SOCK_SEQPACKET (i.e.  ListenSequentialPacket=) is only available for AF_UNIX sockets.  SOCK_STREAM (i.e.  ListenStream=) when used for IP sockets refers
	 *
	 * to TCP sockets, SOCK_DGRAM (i.e.  ListenDatagram=) to UDP.
	 *
	 * These options may be specified more than once, in which case incoming traffic on any of the sockets will trigger service activation, and all listed sockets will be
	 *
	 * passed to the service, regardless of whether there is incoming traffic on them or not. If the empty string is assigned to any of these options, the list of
	 *
	 * addresses to listen on is reset, all prior uses of any of these options will have no effect.
	 *
	 * It is also possible to have more than one socket unit for the same service when using Service=, and the service will receive all the sockets configured in all the
	 *
	 * socket units. Sockets configured in one unit are passed in the order of configuration, but no ordering between socket units is specified.
	 *
	 * If an IP address is used here, it is often desirable to listen on it before the interface it is configured on is up and running, and even regardless of whether it
	 *
	 * will be up and running at any point. To deal with this, it is recommended to set the FreeBind= option described below.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenStream=
	 */
	ListenStream: MaybeArray<string>;
	/**
	 * Specifies an address to listen on for a stream (SOCK_STREAM), datagram (SOCK_DGRAM), or sequential packet (SOCK_SEQPACKET) socket, respectively. The address can be
	 *
	 * written in various formats:
	 *
	 * If the address starts with a slash ("/"), it is read as file system socket in the AF_UNIX socket family.
	 *
	 * If the address starts with an at symbol ("@"), it is read as abstract namespace socket in the AF_UNIX family. The "@" is replaced with a NUL character before
	 *
	 * binding. For details, see unix(7).
	 *
	 * If the address string is a single number, it is read as port number to listen on via IPv6. Depending on the value of BindIPv6Only= (see below) this might result in
	 *
	 * the service being available via both IPv6 and IPv4 (default) or just via IPv6.
	 *
	 * If the address string is a string in the format "v.w.x.y:z", it is interpreted as IPv4 address v.w.x.y and port z.
	 *
	 * If the address string is a string in the format "[x]:y", it is interpreted as IPv6 address x and port y. An optional interface scope (interface name or number) may
	 *
	 * be specified after a "%" symbol: "[x]:y%dev". Interface scopes are only useful with link-local addresses, because the kernel ignores them in other cases. Note that
	 *
	 * if an address is specified as IPv6, it might still make the service available via IPv4 too, depending on the BindIPv6Only= setting (see below).
	 *
	 * If the address string is a string in the format "vsock:x:y", it is read as CID x on a port y address in the AF_VSOCK family. The CID is a unique 32-bit integer
	 *
	 * identifier in AF_VSOCK analogous to an IP address. Specifying the CID is optional, and may be set to the empty string.
	 *
	 * Note that SOCK_SEQPACKET (i.e.  ListenSequentialPacket=) is only available for AF_UNIX sockets.  SOCK_STREAM (i.e.  ListenStream=) when used for IP sockets refers
	 *
	 * to TCP sockets, SOCK_DGRAM (i.e.  ListenDatagram=) to UDP.
	 *
	 * These options may be specified more than once, in which case incoming traffic on any of the sockets will trigger service activation, and all listed sockets will be
	 *
	 * passed to the service, regardless of whether there is incoming traffic on them or not. If the empty string is assigned to any of these options, the list of
	 *
	 * addresses to listen on is reset, all prior uses of any of these options will have no effect.
	 *
	 * It is also possible to have more than one socket unit for the same service when using Service=, and the service will receive all the sockets configured in all the
	 *
	 * socket units. Sockets configured in one unit are passed in the order of configuration, but no ordering between socket units is specified.
	 *
	 * If an IP address is used here, it is often desirable to listen on it before the interface it is configured on is up and running, and even regardless of whether it
	 *
	 * will be up and running at any point. To deal with this, it is recommended to set the FreeBind= option described below.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenStream=
	 */
	ListenDatagram: MaybeArray<string>;
	/**
	 * Specifies an address to listen on for a stream (SOCK_STREAM), datagram (SOCK_DGRAM), or sequential packet (SOCK_SEQPACKET) socket, respectively. The address can be
	 *
	 * written in various formats:
	 *
	 * If the address starts with a slash ("/"), it is read as file system socket in the AF_UNIX socket family.
	 *
	 * If the address starts with an at symbol ("@"), it is read as abstract namespace socket in the AF_UNIX family. The "@" is replaced with a NUL character before
	 *
	 * binding. For details, see unix(7).
	 *
	 * If the address string is a single number, it is read as port number to listen on via IPv6. Depending on the value of BindIPv6Only= (see below) this might result in
	 *
	 * the service being available via both IPv6 and IPv4 (default) or just via IPv6.
	 *
	 * If the address string is a string in the format "v.w.x.y:z", it is interpreted as IPv4 address v.w.x.y and port z.
	 *
	 * If the address string is a string in the format "[x]:y", it is interpreted as IPv6 address x and port y. An optional interface scope (interface name or number) may
	 *
	 * be specified after a "%" symbol: "[x]:y%dev". Interface scopes are only useful with link-local addresses, because the kernel ignores them in other cases. Note that
	 *
	 * if an address is specified as IPv6, it might still make the service available via IPv4 too, depending on the BindIPv6Only= setting (see below).
	 *
	 * If the address string is a string in the format "vsock:x:y", it is read as CID x on a port y address in the AF_VSOCK family. The CID is a unique 32-bit integer
	 *
	 * identifier in AF_VSOCK analogous to an IP address. Specifying the CID is optional, and may be set to the empty string.
	 *
	 * Note that SOCK_SEQPACKET (i.e.  ListenSequentialPacket=) is only available for AF_UNIX sockets.  SOCK_STREAM (i.e.  ListenStream=) when used for IP sockets refers
	 *
	 * to TCP sockets, SOCK_DGRAM (i.e.  ListenDatagram=) to UDP.
	 *
	 * These options may be specified more than once, in which case incoming traffic on any of the sockets will trigger service activation, and all listed sockets will be
	 *
	 * passed to the service, regardless of whether there is incoming traffic on them or not. If the empty string is assigned to any of these options, the list of
	 *
	 * addresses to listen on is reset, all prior uses of any of these options will have no effect.
	 *
	 * It is also possible to have more than one socket unit for the same service when using Service=, and the service will receive all the sockets configured in all the
	 *
	 * socket units. Sockets configured in one unit are passed in the order of configuration, but no ordering between socket units is specified.
	 *
	 * If an IP address is used here, it is often desirable to listen on it before the interface it is configured on is up and running, and even regardless of whether it
	 *
	 * will be up and running at any point. To deal with this, it is recommended to set the FreeBind= option described below.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenStream=
	 */
	ListenSequentialPacket: MaybeArray<string>;
	/**
	 * Specifies a file system FIFO (see fifo(7) for details) to listen on. This expects an absolute file system path as argument. Behavior otherwise is very similar to
	 *
	 * the ListenDatagram= directive above.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenFIFO=
	 */
	ListenFIFO: MaybeArray<string>;
	/**
	 * Specifies a special file in the file system to listen on. This expects an absolute file system path as argument. Behavior otherwise is very similar to the
	 *
	 * ListenFIFO= directive above. Use this to open character device nodes as well as special files in /proc/ and /sys/.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenSpecial=
	 */
	ListenSpecial: MaybeArray<string>;
	/**
	 * Specifies a Netlink family to create a socket for to listen on. This expects a short string referring to the AF_NETLINK family name (such as audit or
	 *
	 * kobject-uevent) as argument, optionally suffixed by a whitespace followed by a multicast group integer. Behavior otherwise is very similar to the ListenDatagram=
	 *
	 * directive above.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenNetlink=
	 */
	ListenNetlink: MaybeArray<string>;
	/**
	 * Specifies a POSIX message queue name to listen on (see mq_overview(7) for details). This expects a valid message queue name (i.e. beginning with "/"). Behavior
	 *
	 * otherwise is very similar to the ListenFIFO= directive above. On Linux message queue descriptors are actually file descriptors and can be inherited between
	 *
	 * processes.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenMessageQueue=
	 */
	ListenMessageQueue: MaybeArray<string>;
	/**
	 * Specifies a USB FunctionFS[1] endpoints location to listen on, for implementation of USB gadget functions. This expects an absolute file system path of a FunctionFS
	 *
	 * mount point as the argument. Behavior otherwise is very similar to the ListenFIFO= directive above. Use this to open the FunctionFS endpoint ep0. When using this
	 *
	 * option, the activated service has to have the USBFunctionDescriptors= and USBFunctionStrings= options set.
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ListenUSBFunction=
	 */
	ListenUSBFunction: MaybeArray<string>;
	/**
	 * Takes one of udplite or sctp. The socket will use the UDP-Lite (IPPROTO_UDPLITE) or SCTP (IPPROTO_SCTP) protocol, respectively.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketProtocol=
	 */
	SocketProtocol: "udplite" | "sctp" | string;
	/**
	 * Takes one of default, both or ipv6-only. Controls the IPV6_V6ONLY socket option (see ipv6(7) for details). If both, IPv6 sockets bound will be accessible via both
	 *
	 * IPv4 and IPv6. If ipv6-only, they will be accessible via IPv6 only. If default (which is the default, surprise!), the system wide default setting is used, as
	 *
	 * controlled by /proc/sys/net/ipv6/bindv6only, which in turn defaults to the equivalent of both.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#BindIPv6Only=
	 */
	BindIPv6Only: "default" | "both" | "ipv6-only" | string;
	/**
	 * Takes an unsigned 32-bit integer argument. Specifies the number of connections to queue that have not been accepted yet. This setting matters only for stream and
	 *
	 * sequential packet sockets. See listen(2) for details. Defaults to 4294967295. Note that this value is silently capped by the "net.core.somaxconn" sysctl, which
	 *
	 * typically defaults to 4096, so typically the sysctl is the setting that actually matters.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Backlog=
	 */
	Backlog: MaybeArray<string>;
	/**
	 * Specifies a network interface name to bind this socket to. If set, traffic will only be accepted from the specified network interfaces. This controls the
	 *
	 * SO_BINDTODEVICE socket option (see socket(7) for details). If this option is used, an implicit dependency from this socket unit on the network interface device unit
	 *
	 * is created (see systemd.device(5)). Note that setting this parameter might result in additional dependencies to be added to the unit (see above).
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#BindToDevice=
	 */
	BindToDevice: MaybeArray<string>;
	/**
	 * Takes a UNIX user/group name. When specified, all AF_UNIX sockets and FIFO nodes in the file system are owned by the specified user and group. If unset (the
	 *
	 * default), the nodes are owned by the root user/group (if run in system context) or the invoking user/group (if run in user context). If only a user is specified but
	 *
	 * no group, then the group is derived from the user's default group.
	 *
	 * Added in version 214.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketUser=
	 */
	SocketUser: MaybeArray<string>;
	/**
	 * Takes a UNIX user/group name. When specified, all AF_UNIX sockets and FIFO nodes in the file system are owned by the specified user and group. If unset (the
	 *
	 * default), the nodes are owned by the root user/group (if run in system context) or the invoking user/group (if run in user context). If only a user is specified but
	 *
	 * no group, then the group is derived from the user's default group.
	 *
	 * Added in version 214.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketUser=
	 */
	SocketGroup: MaybeArray<string>;
	/**
	 * If listening on a file system socket or FIFO, this option specifies the file system access mode used when creating the file node. Takes an access mode in octal
	 *
	 * notation. Defaults to 0666.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SocketMode=
	 */
	SocketMode: MaybeArray<string>;
	/**
	 * If listening on a file system socket or FIFO, the parent directories are automatically created if needed. This option specifies the file system access mode used
	 *
	 * when creating these directories. Takes an access mode in octal notation. Defaults to 0755.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#DirectoryMode=
	 */
	DirectoryMode: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If yes, a service instance is spawned for each incoming connection and only the connection socket is passed to it. If no, all listening
	 *
	 * sockets themselves are passed to the started service unit, and only one service unit is spawned for all connections (also see above). This value is ignored for
	 *
	 * datagram sockets and FIFOs where a single service unit unconditionally handles all incoming traffic. Defaults to no. For performance reasons, it is recommended to
	 *
	 * write new daemons only in a way that is suitable for Accept=no. A daemon listening on an AF_UNIX socket may, but does not need to, call close(2) on the received
	 *
	 * socket before exiting. However, it must not unlink the socket from a file system. It should not invoke shutdown(2) on sockets it got with Accept=no, but it may do
	 *
	 * so for sockets it got with Accept=yes set. Setting Accept=yes is mostly useful to allow daemons designed for usage with inetd(8) to work unmodified with systemd
	 *
	 * socket activation.
	 *
	 * Note that depending on this setting the services activated by units of this type are either regular services (in case of Accept=no) or instances of templated
	 *
	 * services (in case of Accept=yes). See the Description section above for a more detailed discussion of the naming rules of triggered services.
	 *
	 * For IPv4 and IPv6 connections, the REMOTE_ADDR environment variable will contain the remote IP address, and REMOTE_PORT will contain the remote port. This is the
	 *
	 * same as the format used by CGI. For SOCK_RAW, the port is the IP protocol.
	 *
	 * It is recommended to set CollectMode=inactive-or-failed for service instances activated via Accept=yes, to ensure that failed connection services are cleaned up and
	 *
	 * released from memory, and do not accumulate.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Accept=
	 */
	Accept: MaybeArray<string>;
	/**
	 * Takes a boolean argument. May only be used in conjunction with ListenSpecial=. If true, the specified special file is opened in read-write mode, if false, in
	 *
	 * read-only mode. Defaults to false.
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Writable=
	 */
	Writable: MaybeArray<BooleanType>;
	/**
	 * Takes a boolean argument. May only be used when Accept=no. If yes, the socket's buffers are cleared after the triggered service exited. This causes any pending data
	 *
	 * to be flushed and any pending incoming connections to be rejected. If no, the socket's buffers won't be cleared, permitting the service to handle any pending
	 *
	 * connections after restart, which is the usually expected behaviour. Defaults to no.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#FlushPending=
	 */
	FlushPending: MaybeArray<string>;
	/**
	 * The maximum number of connections to simultaneously run services instances for, when Accept=yes is set. If more concurrent connections are coming in, they will be
	 *
	 * refused until at least one existing connection is terminated. This setting has no effect on sockets configured with Accept=no or datagram sockets. Defaults to 64.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MaxConnections=
	 */
	MaxConnections: MaybeArray<string>;
	/**
	 * The maximum number of connections for a service per source IP address. This is very similar to the MaxConnections= directive above. Disabled by default.
	 *
	 * Added in version 232.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MaxConnectionsPerSource=
	 */
	MaxConnectionsPerSource: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, the TCP/IP stack will send a keep alive message after 2h (depending on the configuration of
	 *
	 * /proc/sys/net/ipv4/tcp_keepalive_time) for all TCP streams accepted on this socket. This controls the SO_KEEPALIVE socket option (see socket(7) and the TCP
	 *
	 * Keepalive HOWTO[2] for details.) Defaults to false.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAlive=
	 */
	KeepAlive: MaybeArray<string>;
	/**
	 * Takes time (in seconds) as argument. The connection needs to remain idle before TCP starts sending keepalive probes. This controls the TCP_KEEPIDLE socket option
	 *
	 * (see socket(7) and the TCP Keepalive HOWTO[2] for details.) Default value is 7200 seconds (2 hours).
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAliveTimeSec=
	 */
	KeepAliveTimeSec: MaybeArray<string>;
	/**
	 * Takes time (in seconds) as argument between individual keepalive probes, if the socket option SO_KEEPALIVE has been set on this socket. This controls the
	 *
	 * TCP_KEEPINTVL socket option (see socket(7) and the TCP Keepalive HOWTO[2] for details.) Default value is 75 seconds.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAliveIntervalSec=
	 */
	KeepAliveIntervalSec: MaybeArray<string>;
	/**
	 * Takes an integer as argument. It is the number of unacknowledged probes to send before considering the connection dead and notifying the application layer. This
	 *
	 * controls the TCP_KEEPCNT socket option (see socket(7) and the TCP Keepalive HOWTO[2] for details.) Default value is 9.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#KeepAliveProbes=
	 */
	KeepAliveProbes: MaybeArray<string>;
	/**
	 * Takes a boolean argument. TCP Nagle's algorithm works by combining a number of small outgoing messages, and sending them all at once. This controls the TCP_NODELAY
	 *
	 * socket option (see tcp(7)). Defaults to false.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#NoDelay=
	 */
	NoDelay: MaybeArray<string>;
	/**
	 * Takes an integer argument controlling the priority for all traffic sent from this socket. This controls the SO_PRIORITY socket option (see socket(7) for details.).
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Priority=
	 */
	Priority: MaybeArray<string>;
	/**
	 * Takes time (in seconds) as argument. If set, the listening process will be awakened only when data arrives on the socket, and not immediately when connection is
	 *
	 * established. When this option is set, the TCP_DEFER_ACCEPT socket option will be used (see tcp(7)), and the kernel will ignore initial ACK packets without any data.
	 *
	 * The argument specifies the approximate amount of time the kernel should wait for incoming data before falling back to the normal behavior of honoring empty ACK
	 *
	 * packets. This option is beneficial for protocols where the client sends the data first (e.g. HTTP, in contrast to SMTP), because the server process will not be
	 *
	 * woken up unnecessarily before it can take any action.
	 *
	 * If the client also uses the TCP_DEFER_ACCEPT option, the latency of the initial connection may be reduced, because the kernel will send data in the final packet
	 *
	 * establishing the connection (the third packet in the "three-way handshake").
	 *
	 * Disabled by default.
	 *
	 * Added in version 216.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#DeferAcceptSec=
	 */
	DeferAcceptSec: MaybeArray<string>;
	/**
	 * Takes an integer argument controlling the receive or send buffer sizes of this socket, respectively. This controls the SO_RCVBUF and SO_SNDBUF socket options (see
	 *
	 * socket(7) for details.). The usual suffixes K, M, G are supported and are understood to the base of 1024.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ReceiveBuffer=
	 */
	ReceiveBuffer: MaybeArray<string>;
	/**
	 * Takes an integer argument controlling the receive or send buffer sizes of this socket, respectively. This controls the SO_RCVBUF and SO_SNDBUF socket options (see
	 *
	 * socket(7) for details.). The usual suffixes K, M, G are supported and are understood to the base of 1024.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ReceiveBuffer=
	 */
	SendBuffer: MaybeArray<string>;
	/**
	 * Takes an integer argument controlling the IP Type-Of-Service field for packets generated from this socket. This controls the IP_TOS socket option (see ip(7) for
	 *
	 * details.). Either a numeric string or one of low-delay, throughput, reliability or low-cost may be specified.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#IPTOS=
	 */
	IPTOS: MaybeArray<string>;
	/**
	 * Takes an integer argument controlling the IPv4 Time-To-Live/IPv6 Hop-Count field for packets generated from this socket. This sets the IP_TTL/IPV6_UNICAST_HOPS
	 *
	 * socket options (see ip(7) and ipv6(7) for details.)
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#IPTTL=
	 */
	IPTTL: MaybeArray<string>;
	/**
	 * Takes an integer value. Controls the firewall mark of packets generated by this socket. This can be used in the firewall logic to filter packets from this socket.
	 *
	 * This sets the SO_MARK socket option. See iptables(8) for details.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Mark=
	 */
	Mark: MaybeArray<string>;
	/**
	 * Takes a boolean value. If true, allows multiple bind(2)s to this TCP or UDP port. This controls the SO_REUSEPORT socket option. See socket(7) for details.
	 *
	 * Added in version 206.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ReusePort=
	 */
	ReusePort: MaybeArray<string>;
	/**
	 * Takes a string value. Controls the extended attributes "security.SMACK64", "security.SMACK64IPIN" and "security.SMACK64IPOUT", respectively, i.e. the security label
	 *
	 * of the FIFO, or the security label for the incoming or outgoing connections of the socket, respectively. See Smack[3] for details.
	 *
	 * Added in version 196.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SmackLabel=
	 */
	SmackLabel: MaybeArray<string>;
	/**
	 * Takes a string value. Controls the extended attributes "security.SMACK64", "security.SMACK64IPIN" and "security.SMACK64IPOUT", respectively, i.e. the security label
	 *
	 * of the FIFO, or the security label for the incoming or outgoing connections of the socket, respectively. See Smack[3] for details.
	 *
	 * Added in version 196.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SmackLabel=
	 */
	SmackLabelIPIn: MaybeArray<string>;
	/**
	 * Takes a string value. Controls the extended attributes "security.SMACK64", "security.SMACK64IPIN" and "security.SMACK64IPOUT", respectively, i.e. the security label
	 *
	 * of the FIFO, or the security label for the incoming or outgoing connections of the socket, respectively. See Smack[3] for details.
	 *
	 * Added in version 196.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SmackLabel=
	 */
	SmackLabelIPOut: MaybeArray<string>;
	/**
	 * Takes a boolean argument. When true, systemd will attempt to figure out the SELinux label used for the instantiated service from the information handed by the peer
	 *
	 * over the network. Note that only the security level is used from the information provided by the peer. Other parts of the resulting SELinux context originate from
	 *
	 * either the target binary that is effectively triggered by socket unit or from the value of the SELinuxContext= option. This configuration option applies only when
	 *
	 * activated service is passed in single socket file descriptor, i.e. service instances that have standard input connected to a socket or services triggered by exactly
	 *
	 * one socket unit. Also note that this option is useful only when MLS/MCS SELinux policy is deployed. Defaults to "false".
	 *
	 * Added in version 217.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#SELinuxContextFromNet=
	 */
	SELinuxContextFromNet: MaybeArray<string>;
	/**
	 * Takes a size in bytes. Controls the pipe buffer size of FIFOs configured in this socket unit. See fcntl(2) for details. The usual suffixes K, M, G are supported and
	 *
	 * are understood to the base of 1024.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PipeSize=
	 */
	PipeSize: MaybeArray<string>;
	/**
	 * These two settings take integer values and control the mq_maxmsg field or the mq_msgsize field, respectively, when creating the message queue. Note that either none
	 *
	 * or both of these variables need to be set. See mq_setattr(3) for details.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MessageQueueMaxMessages=
	 */
	MessageQueueMaxMessages: MaybeArray<string>;
	/**
	 * These two settings take integer values and control the mq_maxmsg field or the mq_msgsize field, respectively, when creating the message queue. Note that either none
	 *
	 * or both of these variables need to be set. See mq_setattr(3) for details.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#MessageQueueMaxMessages=
	 */
	MessageQueueMessageSize: MaybeArray<string>;
	/**
	 * Takes a boolean value. Controls whether the socket can be bound to non-local IP addresses. This is useful to configure sockets listening on specific IP addresses
	 *
	 * before those IP addresses are successfully configured on a network interface. This sets the IP_FREEBIND/IPV6_FREEBIND socket option. For robustness reasons it is
	 *
	 * recommended to use this option whenever you bind a socket to a specific IP address. Defaults to false.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#FreeBind=
	 */
	FreeBind: MaybeArray<string>;
	/**
	 * Takes a boolean value. Controls the IP_TRANSPARENT/IPV6_TRANSPARENT socket option. Defaults to false.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Transparent=
	 */
	Transparent: MaybeArray<string>;
	/**
	 * Takes a boolean value. This controls the SO_BROADCAST socket option, which allows broadcast datagrams to be sent from this socket. Defaults to false.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Broadcast=
	 */
	Broadcast: MaybeArray<string>;
	/**
	 * Takes a boolean value. This controls the SO_PASSCRED socket option, which allows AF_UNIX sockets to receive the credentials of the sending process in an ancillary
	 *
	 * message. Defaults to false.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PassCredentials=
	 */
	PassCredentials: MaybeArray<string>;
	/**
	 * Takes a boolean value. This controls the SO_PASSSEC socket option, which allows AF_UNIX sockets to receive the security context of the sending process in an
	 *
	 * ancillary message. Defaults to false.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PassSecurity=
	 */
	PassSecurity: MaybeArray<string>;
	/**
	 * Takes a boolean value. This controls the IP_PKTINFO, IPV6_RECVPKTINFO, NETLINK_PKTINFO or PACKET_AUXDATA socket options, which enable reception of additional
	 *
	 * per-packet metadata as ancillary message, on AF_INET, AF_INET6, AF_UNIX and AF_PACKET sockets. Defaults to false.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PassPacketInfo=
	 */
	PassPacketInfo: MaybeArray<string>;
	/**
	 * Takes one of "off", "us" (alias: "usec", "μs") or "ns" (alias: "nsec"). This controls the SO_TIMESTAMP or SO_TIMESTAMPNS socket options, and enables whether ingress
	 *
	 * network traffic shall carry timestamping metadata. Defaults to off.
	 *
	 * Added in version 247.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Timestamping=
	 */
	Timestamping: "off" | "us" | string;
	/**
	 * Takes a string value. Controls the TCP congestion algorithm used by this socket. Should be one of "westwood", "reno", "cubic", "lp" or any other available algorithm
	 *
	 * supported by the IP stack. This setting applies only to stream sockets.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TCPCongestion=
	 */
	TCPCongestion: MaybeArray<string>;
	/**
	 * Takes one or more command lines, which are executed before or after the listening sockets/FIFOs are created and bound, respectively. The first token of the command
	 *
	 * line must be an absolute filename, then followed by arguments for the process. Multiple command lines may be specified following the same scheme as used for
	 *
	 * ExecStartPre= of service unit files.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStartPre=
	 */
	ExecStartPre: MaybeArray<string>;
	/**
	 * Takes one or more command lines, which are executed before or after the listening sockets/FIFOs are created and bound, respectively. The first token of the command
	 *
	 * line must be an absolute filename, then followed by arguments for the process. Multiple command lines may be specified following the same scheme as used for
	 *
	 * ExecStartPre= of service unit files.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStartPre=
	 */
	ExecStartPost: MaybeArray<string>;
	/**
	 * Additional commands that are executed before or after the listening sockets/FIFOs are closed and removed, respectively. Multiple command lines may be specified
	 *
	 * following the same scheme as used for ExecStartPre= of service unit files.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStopPre=
	 */
	ExecStopPre: MaybeArray<string>;
	/**
	 * Additional commands that are executed before or after the listening sockets/FIFOs are closed and removed, respectively. Multiple command lines may be specified
	 *
	 * following the same scheme as used for ExecStartPre= of service unit files.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#ExecStopPre=
	 */
	ExecStopPost: MaybeArray<string>;
	/**
	 * Configures the time to wait for the commands specified in ExecStartPre=, ExecStartPost=, ExecStopPre= and ExecStopPost= to finish. If a command does not exit within
	 *
	 * the configured time, the socket will be considered failed and be shut down again. All commands still running will be terminated forcibly via SIGTERM, and after
	 *
	 * another delay of this time with SIGKILL. (See KillMode= in systemd.kill(5).) Takes a unit-less value in seconds, or a time span value such as "5min 20s". Pass "0"
	 *
	 * to disable the timeout logic. Defaults to DefaultTimeoutStartSec= from the manager configuration file (see systemd-system.conf(5)).
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TimeoutSec=
	 */
	TimeoutSec: string | number;
	/**
	 * Specifies the service unit name to activate on incoming traffic. This setting is only allowed for sockets with Accept=no. It defaults to the service that bears the
	 *
	 * same name as the socket (with the suffix replaced). In most cases, it should not be necessary to use this option. Note that setting this parameter might result in
	 *
	 * additional dependencies to be added to the unit (see above).
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Service=
	 */
	Service: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If enabled, any file nodes created by this socket unit are removed when it is stopped. This applies to AF_UNIX sockets in the file system,
	 *
	 * POSIX message queues, FIFOs, as well as any symlinks to them configured with Symlinks=. Normally, it should not be necessary to use this option, and is not
	 *
	 * recommended as services might continue to run after the socket unit has been terminated and it should still be possible to communicate with them via their file
	 *
	 * system node. Defaults to off.
	 *
	 * Added in version 214.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#RemoveOnStop=
	 */
	RemoveOnStop: MaybeArray<string>;
	/**
	 * Takes a list of file system paths. The specified paths will be created as symlinks to the AF_UNIX socket path or FIFO path of this socket unit. If this setting is
	 *
	 * used, only one AF_UNIX socket in the file system or one FIFO may be configured for the socket unit. Use this option to manage one or more symlinked alias names for
	 *
	 * a socket, binding their lifecycle together. Note that if creation of a symlink fails this is not considered fatal for the socket unit, and the socket unit may still
	 *
	 * start. If an empty string is assigned, the list of paths is reset. Defaults to an empty list.
	 *
	 * Added in version 214.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#Symlinks=
	 */
	Symlinks: string[];
	/**
	 * Assigns a name to all file descriptors this socket unit encapsulates. This is useful to help activated services identify specific file descriptors, if multiple fds
	 *
	 * are passed. Services may use the sd_listen_fds_with_names(3) call to acquire the names configured for the received file descriptors. Names may contain any ASCII
	 *
	 * character, but must exclude control characters and ":", and must be at most 255 characters in length. If this setting is not used, the file descriptor name defaults
	 *
	 * to the name of the socket unit, including its .socket suffix.
	 *
	 * Added in version 227.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#FileDescriptorName=
	 */
	FileDescriptorName: MaybeArray<string>;
	/**
	 * Configures a limit on how often this socket unit may be activated within a specific time interval. The TriggerLimitIntervalSec= setting may be used to configure the
	 *
	 * length of the time interval in the usual time units "us", "ms", "s", "min", "h", ... and defaults to 2s (See systemd.time(7) for details on the various time units
	 *
	 * understood). The TriggerLimitBurst= setting takes a positive integer value and specifies the number of permitted activations per time interval, and defaults to 200
	 *
	 * for Accept=yes sockets (thus by default permitting 200 activations per 2s), and 20 otherwise (20 activations per 2s). Set either to 0 to disable any form of trigger
	 *
	 * rate limiting.
	 *
	 * If the limit is hit, the socket unit is placed into a failure mode, and will not be connectible anymore until restarted. Note that this limit is enforced before the
	 *
	 * service activation is enqueued.
	 *
	 * Compare with PollLimitIntervalSec=/PollLimitBurst= described below, which implements a temporary slowdown if a socket unit is flooded with incoming traffic, as
	 *
	 * opposed to the permanent failure state TriggerLimitIntervalSec=/TriggerLimitBurst= results in.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TriggerLimitIntervalSec=
	 */
	TriggerLimitIntervalSec: MaybeArray<string>;
	/**
	 * Configures a limit on how often this socket unit may be activated within a specific time interval. The TriggerLimitIntervalSec= setting may be used to configure the
	 *
	 * length of the time interval in the usual time units "us", "ms", "s", "min", "h", ... and defaults to 2s (See systemd.time(7) for details on the various time units
	 *
	 * understood). The TriggerLimitBurst= setting takes a positive integer value and specifies the number of permitted activations per time interval, and defaults to 200
	 *
	 * for Accept=yes sockets (thus by default permitting 200 activations per 2s), and 20 otherwise (20 activations per 2s). Set either to 0 to disable any form of trigger
	 *
	 * rate limiting.
	 *
	 * If the limit is hit, the socket unit is placed into a failure mode, and will not be connectible anymore until restarted. Note that this limit is enforced before the
	 *
	 * service activation is enqueued.
	 *
	 * Compare with PollLimitIntervalSec=/PollLimitBurst= described below, which implements a temporary slowdown if a socket unit is flooded with incoming traffic, as
	 *
	 * opposed to the permanent failure state TriggerLimitIntervalSec=/TriggerLimitBurst= results in.
	 *
	 * Added in version 230.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#TriggerLimitIntervalSec=
	 */
	TriggerLimitBurst: MaybeArray<string>;
	/**
	 * Configures a limit on how often polling events on the file descriptors backing this socket unit will be considered. This pair of settings is similar to
	 *
	 * TriggerLimitIntervalSec=/TriggerLimitBurst= but instead of putting a (fatal) limit on the activation frequency puts a (transient) limit on the polling frequency.
	 *
	 * The expected parameter syntax and range are identical to that of the aforementioned options, and can be disabled the same way.
	 *
	 * If the polling limit is hit polling is temporarily disabled on it until the specified time window passes. The polling limit hence slows down connection attempts if
	 *
	 * hit, but unlike the trigger limit won't cause permanent failures. It's the recommended mechanism to deal with DoS attempts through packet flooding.
	 *
	 * The polling limit is enforced per file descriptor to listen on, as opposed to the trigger limit which is enforced for the entire socket unit. This distinction
	 *
	 * matters for socket units that listen on multiple file descriptors (i.e. have multiple ListenXYZ= stanzas).
	 *
	 * These setting defaults to 150 (in case of Accept=yes) and 15 (otherwise) polling events per 2s. This is considerably lower than the default values for the trigger
	 *
	 * limit (see above) and means that the polling limit should typically ensure the trigger limit is never hit, unless one of them is reconfigured or disabled.
	 *
	 * Added in version 255.
	 *
	 * Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PollLimitIntervalSec=
	 */
	PollLimitIntervalSec: MaybeArray<string>;
	/**
	 * Configures a limit on how often polling events on the file descriptors backing this socket unit will be considered. This pair of settings is similar to
	 *
	 * TriggerLimitIntervalSec=/TriggerLimitBurst= but instead of putting a (fatal) limit on the activation frequency puts a (transient) limit on the polling frequency.
	 *
	 * The expected parameter syntax and range are identical to that of the aforementioned options, and can be disabled the same way.
	 *
	 * If the polling limit is hit polling is temporarily disabled on it until the specified time window passes. The polling limit hence slows down connection attempts if
	 *
	 * hit, but unlike the trigger limit won't cause permanent failures. It's the recommended mechanism to deal with DoS attempts through packet flooding.
	 *
	 * The polling limit is enforced per file descriptor to listen on, as opposed to the trigger limit which is enforced for the entire socket unit. This distinction
	 *
	 * matters for socket units that listen on multiple file descriptors (i.e. have multiple ListenXYZ= stanzas).
	 *
	 * These setting defaults to 150 (in case of Accept=yes) and 15 (otherwise) polling events per 2s. This is considerably lower than the default values for the trigger
	 *
	 * limit (see above) and means that the polling limit should typically ensure the trigger limit is never hit, unless one of them is reconfigured or disabled.
	 *
	 * Added in version 255.
	 *
	 * Check systemd.unit(5), systemd.exec(5), and systemd.kill(5) for more settings.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.socket.html#PollLimitIntervalSec=
	 */
	PollLimitBurst: MaybeArray<string>;
}
export interface ISocketUnit {
	Socket: ISocketOptions;
}
