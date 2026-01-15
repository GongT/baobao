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
 * The unit file may include a [Unit] section, which carries generic information about the unit that is not dependent on the type of unit:
 *
 */
export interface IUnitOptions {
	/**
	 * A short human readable title of the unit. This may be used by systemd (and other UIs) as a user-visible label for the unit, so this string should identify the unit
	 *
	 * rather than describe it, despite the name. This string also shouldn't just repeat the unit name.  "Apache2 Web Server" is a good example. Bad examples are
	 *
	 * "high-performance light-weight HTTP server" (too generic) or "Apache2" (meaningless for people who do not know Apache, duplicates the unit name).  systemd may use
	 *
	 * this string as a noun in status messages ("Starting description...", "Started description.", "Reached target description.", "Failed to start description."), so it
	 *
	 * should be capitalized, and should not be a full sentence, or a phrase with a continuous verb. Bad examples include "exiting the container" or "updating the database
	 *
	 * once per day.".
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Description=
	 */
	Description: MaybeArray<string>;
	/**
	 * A space-separated list of URIs referencing documentation for this unit or its configuration. Accepted are only URIs of the types "http://", "https://", "file:",
	 *
	 * "info:", "man:". For more information about the syntax of these URIs, see uri(7). The URIs should be listed in order of relevance, starting with the most relevant.
	 *
	 * It is a good idea to first reference documentation that explains what the unit's purpose is, followed by how it is configured, followed by any other related
	 *
	 * documentation. This option may be specified more than once, in which case the specified list of URIs is merged. If the empty string is assigned to this option, the
	 *
	 * list is reset and all prior assignments will have no effect.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Documentation=
	 */
	Documentation: MaybeArray<string>;
	/**
	 * Configures (weak) requirement dependencies on other units. This option may be specified more than once or multiple space-separated units may be specified in one
	 *
	 * option in which case dependencies for all listed names will be created. Dependencies of this type may also be configured outside of the unit configuration file by
	 *
	 * adding a symlink to a .wants/ directory accompanying the unit file. For details, see above.
	 *
	 * Units listed in this option will be started if the configuring unit is. However, if the listed units fail to start or cannot be added to the transaction, this has
	 *
	 * no impact on the validity of the transaction as a whole, and this unit will still be started. This is the recommended way to hook the start-up of one unit to the
	 *
	 * start-up of another unit.
	 *
	 * Note that requirement dependencies do not influence the order in which services are started or stopped. This has to be configured independently with the After= or
	 *
	 * Before= options. If unit foo.service pulls in unit bar.service as configured with Wants= and no ordering is configured with After= or Before=, then both units will
	 *
	 * be started simultaneously and without any delay between them if foo.service is activated.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Wants=
	 */
	Wants: MaybeArray<string>;
	/**
	 * Similar to Wants=, but declares a stronger requirement dependency. Dependencies of this type may also be configured by adding a symlink to a .requires/ directory
	 *
	 * accompanying the unit file.
	 *
	 * If this unit gets activated, the units listed will be activated as well. If one of the other units fails to activate, and an ordering dependency After= on the
	 *
	 * failing unit is set, this unit will not be started. Besides, with or without specifying After=, this unit will be stopped (or restarted) if one of the other units
	 *
	 * is explicitly stopped (or restarted).
	 *
	 * Often, it is a better choice to use Wants= instead of Requires= in order to achieve a system that is more robust when dealing with failing services.
	 *
	 * Note that this dependency type does not imply that the other unit always has to be in active state when this unit is running. Specifically: failing condition checks
	 *
	 * (such as ConditionPathExists=, ConditionPathIsSymbolicLink=, ... — see below) do not cause the start job of a unit with a Requires= dependency on it to fail. Also,
	 *
	 * some unit types may deactivate on their own (for example, a service process may decide to exit cleanly, or a device may be unplugged by the user), which is not
	 *
	 * propagated to units having a Requires= dependency. Use the BindsTo= dependency type together with After= to ensure that a unit may never be in active state without
	 *
	 * a specific other unit also in active state (see below).
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Requires=
	 */
	Requires: MaybeArray<string>;
	/**
	 * Similar to Requires=. However, if the units listed here are not started already, they will not be started and the starting of this unit will fail immediately.
	 *
	 * Requisite= does not imply an ordering dependency, even if both units are started in the same transaction. Hence this setting should usually be combined with After=,
	 *
	 * to ensure this unit is not started before the other unit.
	 *
	 * When Requisite=b.service is used on a.service, this dependency will show as RequisiteOf=a.service in property listing of b.service.  RequisiteOf= dependency cannot
	 *
	 * be specified directly.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Requisite=
	 */
	Requisite: MaybeArray<string>;
	/**
	 * Configures requirement dependencies, very similar in style to Requires=. However, this dependency type is stronger: in addition to the effect of Requires= it
	 *
	 * declares that if the unit bound to is stopped, this unit will be stopped too. This means a unit bound to another unit that suddenly enters inactive state will be
	 *
	 * stopped too. Units can suddenly, unexpectedly enter inactive state for different reasons: the main process of a service unit might terminate on its own choice, the
	 *
	 * backing device of a device unit might be unplugged or the mount point of a mount unit might be unmounted without involvement of the system and service manager.
	 *
	 * When used in conjunction with After= on the same unit the behaviour of BindsTo= is even stronger. In this case, the unit bound to strictly has to be in active state
	 *
	 * for this unit to also be in active state. This not only means a unit bound to another unit that suddenly enters inactive state, but also one that is bound to
	 *
	 * another unit that gets skipped due to an unmet condition check (such as ConditionPathExists=, ConditionPathIsSymbolicLink=, ... — see below) will be stopped, should
	 *
	 * it be running. Hence, in many cases it is best to combine BindsTo= with After=.
	 *
	 * When BindsTo=b.service is used on a.service, this dependency will show as BoundBy=a.service in property listing of b.service.  BoundBy= dependency cannot be
	 *
	 * specified directly.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#BindsTo=
	 */
	BindsTo: MaybeArray<string>;
	/**
	 * Configures dependencies similar to Requires=, but limited to stopping and restarting of units. When systemd stops or restarts the units listed here, the action is
	 *
	 * propagated to this unit. Note that this is a one-way dependency — changes to this unit do not affect the listed units.
	 *
	 * When PartOf=b.service is used on a.service, this dependency will show as ConsistsOf=a.service in property listing of b.service.  ConsistsOf= dependency cannot be
	 *
	 * specified directly.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PartOf=
	 */
	PartOf: MaybeArray<string>;
	/**
	 * Configures dependencies similar to Wants=, but as long as this unit is up, all units listed in Upholds= are started whenever found to be inactive or failed, and no
	 *
	 * job is queued for them. While a Wants= dependency on another unit has a one-time effect when this units started, a Upholds= dependency on it has a continuous
	 *
	 * effect, constantly restarting the unit if necessary. This is an alternative to the Restart= setting of service units, to ensure they are kept running whatever
	 *
	 * happens. The restart happens without delay, and usual per-unit rate-limit applies.
	 *
	 * When Upholds=b.service is used on a.service, this dependency will show as UpheldBy=a.service in the property listing of b.service.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Upholds=
	 */
	Upholds: MaybeArray<string>;
	/**
	 * A space-separated list of unit names. Configures negative requirement dependencies. If a unit has a Conflicts= setting on another unit, starting the former will
	 *
	 * stop the latter and vice versa.
	 *
	 * Note that this setting does not imply an ordering dependency, similarly to the Wants= and Requires= dependencies described above. This means that to ensure that the
	 *
	 * conflicting unit is stopped before the other unit is started, an After= or Before= dependency must be declared. It doesn't matter which of the two ordering
	 *
	 * dependencies is used, because stop jobs are always ordered before start jobs, see the discussion in Before=/After= below.
	 *
	 * If unit A that conflicts with unit B is scheduled to be started at the same time as B, the transaction will either fail (in case both are required parts of the
	 *
	 * transaction) or be modified to be fixed (in case one or both jobs are not a required part of the transaction). In the latter case, the job that is not required will
	 *
	 * be removed, or in case both are not required, the unit that conflicts will be started and the unit that is conflicted is stopped.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Conflicts=
	 */
	Conflicts: MaybeArray<string>;
	/**
	 * These two settings expect a space-separated list of unit names. They may be specified more than once, in which case dependencies for all listed names are created.
	 *
	 * Those two settings configure ordering dependencies between units. If unit foo.service contains the setting Before=bar.service and both units are being started,
	 *
	 * bar.service's start-up is delayed until foo.service has finished starting up.  After= is the inverse of Before=, i.e. while Before= ensures that the configured unit
	 *
	 * is started before the listed unit begins starting up, After= ensures the opposite, that the listed unit is fully started up before the configured unit is started.
	 *
	 * When two units with an ordering dependency between them are shut down, the inverse of the start-up order is applied. I.e. if a unit is configured with After= on
	 *
	 * another unit, the former is stopped before the latter if both are shut down. Given two units with any ordering dependency between them, if one unit is shut down and
	 *
	 * the other is started up, the shutdown is ordered before the start-up. It doesn't matter if the ordering dependency is After= or Before=, in this case. It also
	 *
	 * doesn't matter which of the two is shut down, as long as one is shut down and the other is started up; the shutdown is ordered before the start-up in all cases. If
	 *
	 * two units have no ordering dependencies between them, they are shut down or started up simultaneously, and no ordering takes place. It depends on the unit type when
	 *
	 * precisely a unit has finished starting up. Most importantly, for service units start-up is considered completed for the purpose of Before=/After= when all its
	 *
	 * configured start-up commands have been invoked and they either failed or reported start-up success. Note that this includes ExecStartPost= (or ExecStopPost= for the
	 *
	 * shutdown case).
	 *
	 * Note that those settings are independent of and orthogonal to the requirement dependencies as configured by Requires=, Wants=, Requisite=, or BindsTo=. It is a
	 *
	 * common pattern to include a unit name in both the After= and Wants= options, in which case the unit listed will be started before the unit that is configured with
	 *
	 * these options.
	 *
	 * Note that Before= dependencies on device units have no effect and are not supported. Devices generally become available as a result of an external hotplug event,
	 *
	 * and systemd creates the corresponding device unit without delay.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Before=
	 */
	Before: MaybeArray<string>;
	/**
	 * These two settings expect a space-separated list of unit names. They may be specified more than once, in which case dependencies for all listed names are created.
	 *
	 * Those two settings configure ordering dependencies between units. If unit foo.service contains the setting Before=bar.service and both units are being started,
	 *
	 * bar.service's start-up is delayed until foo.service has finished starting up.  After= is the inverse of Before=, i.e. while Before= ensures that the configured unit
	 *
	 * is started before the listed unit begins starting up, After= ensures the opposite, that the listed unit is fully started up before the configured unit is started.
	 *
	 * When two units with an ordering dependency between them are shut down, the inverse of the start-up order is applied. I.e. if a unit is configured with After= on
	 *
	 * another unit, the former is stopped before the latter if both are shut down. Given two units with any ordering dependency between them, if one unit is shut down and
	 *
	 * the other is started up, the shutdown is ordered before the start-up. It doesn't matter if the ordering dependency is After= or Before=, in this case. It also
	 *
	 * doesn't matter which of the two is shut down, as long as one is shut down and the other is started up; the shutdown is ordered before the start-up in all cases. If
	 *
	 * two units have no ordering dependencies between them, they are shut down or started up simultaneously, and no ordering takes place. It depends on the unit type when
	 *
	 * precisely a unit has finished starting up. Most importantly, for service units start-up is considered completed for the purpose of Before=/After= when all its
	 *
	 * configured start-up commands have been invoked and they either failed or reported start-up success. Note that this includes ExecStartPost= (or ExecStopPost= for the
	 *
	 * shutdown case).
	 *
	 * Note that those settings are independent of and orthogonal to the requirement dependencies as configured by Requires=, Wants=, Requisite=, or BindsTo=. It is a
	 *
	 * common pattern to include a unit name in both the After= and Wants= options, in which case the unit listed will be started before the unit that is configured with
	 *
	 * these options.
	 *
	 * Note that Before= dependencies on device units have no effect and are not supported. Devices generally become available as a result of an external hotplug event,
	 *
	 * and systemd creates the corresponding device unit without delay.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Before=
	 */
	After: MaybeArray<string>;
	/**
	 * A space-separated list of one or more units that are activated when this unit enters the "failed" state.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnFailure=
	 */
	OnFailure: MaybeArray<string>;
	/**
	 * A space-separated list of one or more units that are activated when this unit enters the "inactive" state.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnSuccess=
	 */
	OnSuccess: MaybeArray<string>;
	/**
	 * A space-separated list of one or more units to which reload requests from this unit shall be propagated to, or units from which reload requests shall be propagated
	 *
	 * to this unit, respectively. Issuing a reload request on a unit will automatically also enqueue reload requests on all units that are linked to it using these two
	 *
	 * settings.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesReloadTo=
	 */
	PropagatesReloadTo: MaybeArray<string>;
	/**
	 * A space-separated list of one or more units to which reload requests from this unit shall be propagated to, or units from which reload requests shall be propagated
	 *
	 * to this unit, respectively. Issuing a reload request on a unit will automatically also enqueue reload requests on all units that are linked to it using these two
	 *
	 * settings.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesReloadTo=
	 */
	ReloadPropagatedFrom: MaybeArray<string>;
	/**
	 * A space-separated list of one or more units to which stop requests from this unit shall be propagated to, or units from which stop requests shall be propagated to
	 *
	 * this unit, respectively. Issuing a stop request on a unit will automatically also enqueue stop requests on all units that are linked to it using these two settings.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesStopTo=
	 */
	PropagatesStopTo: MaybeArray<string>;
	/**
	 * A space-separated list of one or more units to which stop requests from this unit shall be propagated to, or units from which stop requests shall be propagated to
	 *
	 * this unit, respectively. Issuing a stop request on a unit will automatically also enqueue stop requests on all units that are linked to it using these two settings.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#PropagatesStopTo=
	 */
	StopPropagatedFrom: MaybeArray<string>;
	/**
	 * For units that start processes (such as service units), lists one or more other units whose network and/or temporary file namespace to join. If this is specified on
	 *
	 * a unit (say, a.service has JoinsNamespaceOf=b.service), then the inverse dependency (JoinsNamespaceOf=a.service for b.service) is implied. This only applies to unit
	 *
	 * types which support the PrivateNetwork=, NetworkNamespacePath=, PrivateIPC=, IPCNamespacePath=, and PrivateTmp= directives (see systemd.exec(5) for details). If a
	 *
	 * unit that has this setting set is started, its processes will see the same /tmp/, /var/tmp/, IPC namespace and network namespace as one listed unit that is started.
	 *
	 * If multiple listed units are already started and these do not share their namespace, then it is not defined which namespace is joined. Note that this setting only
	 *
	 * has an effect if PrivateNetwork=/NetworkNamespacePath=, PrivateIPC=/IPCNamespacePath= and/or PrivateTmp= is enabled for both the unit that joins the namespace and
	 *
	 * the unit whose namespace is joined.
	 *
	 * Added in version 209.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JoinsNamespaceOf=
	 */
	JoinsNamespaceOf: MaybeArray<string>;
	/**
	 * Takes a space-separated list of absolute paths. Automatically adds dependencies of type Requires= and After= for all mount units required to access the specified
	 *
	 * path.
	 *
	 * Mount points marked with noauto are not mounted automatically through local-fs.target, but are still honored for the purposes of this option, i.e. they will be
	 *
	 * pulled in by this unit.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RequiresMountsFor=
	 */
	RequiresMountsFor: MaybeArray<string>;
	/**
	 * Takes a value of "fail", "replace", "replace-irreversibly", "isolate", "flush", "ignore-dependencies" or "ignore-requirements". Defaults to "replace". Specifies how
	 *
	 * the units listed in OnSuccess=/OnFailure= will be enqueued. See systemctl(1)'s --job-mode= option for details on the possible values. If this is set to "isolate",
	 *
	 * only a single unit may be listed in OnSuccess=/OnFailure=.
	 *
	 * Added in version 209.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnSuccessJobMode=
	 */
	OnSuccessJobMode: MaybeArray<string>;
	/**
	 * Takes a value of "fail", "replace", "replace-irreversibly", "isolate", "flush", "ignore-dependencies" or "ignore-requirements". Defaults to "replace". Specifies how
	 *
	 * the units listed in OnSuccess=/OnFailure= will be enqueued. See systemctl(1)'s --job-mode= option for details on the possible values. If this is set to "isolate",
	 *
	 * only a single unit may be listed in OnSuccess=/OnFailure=.
	 *
	 * Added in version 209.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#OnSuccessJobMode=
	 */
	OnFailureJobMode: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, this unit will not be stopped when isolating another unit. Defaults to false for service, target, socket, timer, and path units,
	 *
	 * and true for slice, scope, device, swap, mount, and automount units.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#IgnoreOnIsolate=
	 */
	IgnoreOnIsolate: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, this unit will be stopped when it is no longer used. Note that, in order to minimize the work to be executed, systemd will not
	 *
	 * stop units by default unless they are conflicting with other units, or the user explicitly requested their shut down. If this option is set, a unit will be
	 *
	 * automatically cleaned up if no other active unit requires it. Defaults to false.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#StopWhenUnneeded=
	 */
	StopWhenUnneeded: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, this unit can only be activated or deactivated indirectly. In this case, explicit start-up or termination requested by the user
	 *
	 * is denied, however if it is started or stopped as a dependency of another unit, start-up or termination will succeed. This is mostly a safety feature to ensure that
	 *
	 * the user does not accidentally activate units that are not intended to be activated explicitly, and not accidentally deactivate units that are not intended to be
	 *
	 * deactivated. These options default to false.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RefuseManualStart=
	 */
	RefuseManualStart: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, this unit can only be activated or deactivated indirectly. In this case, explicit start-up or termination requested by the user
	 *
	 * is denied, however if it is started or stopped as a dependency of another unit, start-up or termination will succeed. This is mostly a safety feature to ensure that
	 *
	 * the user does not accidentally activate units that are not intended to be activated explicitly, and not accidentally deactivate units that are not intended to be
	 *
	 * deactivated. These options default to false.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RefuseManualStart=
	 */
	RefuseManualStop: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If true, this unit may be used with the systemctl isolate command. Otherwise, this will be refused. It probably is a good idea to leave
	 *
	 * this disabled except for target units that shall be used similar to runlevels in SysV init systems, just as a precaution to avoid unusable system states. This
	 *
	 * option defaults to false.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AllowIsolate=
	 */
	AllowIsolate: MaybeArray<string>;
	/**
	 * Takes a boolean argument. If yes, (the default), a few default dependencies will implicitly be created for the unit. The actual dependencies created depend on the
	 *
	 * unit type. For example, for service units, these dependencies ensure that the service is started only after basic system initialization is completed and is properly
	 *
	 * terminated on system shutdown. See the respective man pages for details. Generally, only services involved with early boot or late shutdown should set this option
	 *
	 * to no. It is highly recommended to leave this option enabled for the majority of common units. If set to no, this option does not disable all implicit dependencies,
	 *
	 * just non-essential ones.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#DefaultDependencies=
	 */
	DefaultDependencies: MaybeArray<string>;
	/**
	 * Takes a boolean argument. Defaults to no. If yes, processes belonging to this unit will not be sent the final "SIGTERM" and "SIGKILL" signals during the final phase
	 *
	 * of the system shutdown process. This functionality replaces the older mechanism that allowed a program to set "argv[0][0] = '@'" as described at systemd and Storage
	 *
	 * Daemons for the Root File System[2], which however continues to be supported.
	 *
	 * Added in version 255.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#SurviveFinalKillSignal=
	 */
	SurviveFinalKillSignal: MaybeArray<string>;
	/**
	 * Tweaks the "garbage collection" algorithm for this unit. Takes one of inactive or inactive-or-failed. If set to inactive the unit will be unloaded if it is in the
	 *
	 * inactive state and is not referenced by clients, jobs or other units — however it is not unloaded if it is in the failed state. In failed mode, failed units are not
	 *
	 * unloaded until the user invoked systemctl reset-failed on them to reset the failed state, or an equivalent command. This behaviour is altered if this option is set
	 *
	 * to inactive-or-failed: in this case the unit is unloaded even if the unit is in a failed state, and thus an explicitly resetting of the failed state is not
	 *
	 * necessary. Note that if this mode is used unit results (such as exit codes, exit signals, consumed resources, ...) are flushed out immediately after the unit
	 *
	 * completed, except for what is stored in the logging subsystem. Defaults to inactive.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#CollectMode=
	 */
	CollectMode: "inactive" | "inactive-or-failed" | string;
	/**
	 * Configure the action to take when the unit stops and enters a failed state or inactive state. Takes one of none, reboot, reboot-force, reboot-immediate, poweroff,
	 *
	 * poweroff-force, poweroff-immediate, exit, exit-force, soft-reboot, soft-reboot-force, kexec, kexec-force, halt, halt-force and halt-immediate. In system mode, all
	 *
	 * options are allowed. In user mode, only none, exit, exit-force, soft-reboot and soft-reboot-force are allowed. Both options default to none.
	 *
	 * If none is set, no action will be triggered.  reboot causes a reboot following the normal shutdown procedure (i.e. equivalent to systemctl reboot).  reboot-force
	 *
	 * causes a forced reboot which will terminate all processes forcibly but should cause no dirty file systems on reboot (i.e. equivalent to systemctl reboot -f) and
	 *
	 * reboot-immediate causes immediate execution of the reboot(2) system call, which might result in data loss (i.e. equivalent to systemctl reboot -ff). Similarly,
	 *
	 * poweroff, poweroff-force, poweroff-immediate, kexec, kexec-force, halt, halt-force and halt-immediate have the effect of powering down the system, executing kexec,
	 *
	 * and halting the system respectively with similar semantics.  exit causes the manager to exit following the normal shutdown procedure, and exit-force causes it
	 *
	 * terminate without shutting down services. When exit or exit-force is used by default the exit status of the main process of the unit (if this applies) is returned
	 *
	 * from the service manager. However, this may be overridden with FailureActionExitStatus=/SuccessActionExitStatus=, see below.  soft-reboot will trigger a userspace
	 *
	 * reboot operation.  soft-reboot-force does that too, but does not go through the shutdown transaction beforehand.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureAction=
	 */
	FailureAction: "none" | "reboot" | "reboot-force" | "reboot-immediate" | "poweroff" | "poweroff-force" | "poweroff-immediate" | "exit" | "exit-force" | "soft-reboot" | "soft-reboot-force" | "kexec" | "kexec-force" | "halt" | "halt-force" | "halt-immediate" | string;
	/**
	 * Configure the action to take when the unit stops and enters a failed state or inactive state. Takes one of none, reboot, reboot-force, reboot-immediate, poweroff,
	 *
	 * poweroff-force, poweroff-immediate, exit, exit-force, soft-reboot, soft-reboot-force, kexec, kexec-force, halt, halt-force and halt-immediate. In system mode, all
	 *
	 * options are allowed. In user mode, only none, exit, exit-force, soft-reboot and soft-reboot-force are allowed. Both options default to none.
	 *
	 * If none is set, no action will be triggered.  reboot causes a reboot following the normal shutdown procedure (i.e. equivalent to systemctl reboot).  reboot-force
	 *
	 * causes a forced reboot which will terminate all processes forcibly but should cause no dirty file systems on reboot (i.e. equivalent to systemctl reboot -f) and
	 *
	 * reboot-immediate causes immediate execution of the reboot(2) system call, which might result in data loss (i.e. equivalent to systemctl reboot -ff). Similarly,
	 *
	 * poweroff, poweroff-force, poweroff-immediate, kexec, kexec-force, halt, halt-force and halt-immediate have the effect of powering down the system, executing kexec,
	 *
	 * and halting the system respectively with similar semantics.  exit causes the manager to exit following the normal shutdown procedure, and exit-force causes it
	 *
	 * terminate without shutting down services. When exit or exit-force is used by default the exit status of the main process of the unit (if this applies) is returned
	 *
	 * from the service manager. However, this may be overridden with FailureActionExitStatus=/SuccessActionExitStatus=, see below.  soft-reboot will trigger a userspace
	 *
	 * reboot operation.  soft-reboot-force does that too, but does not go through the shutdown transaction beforehand.
	 *
	 * Added in version 236.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureAction=
	 */
	SuccessAction: "none" | "reboot" | "reboot-force" | "reboot-immediate" | "poweroff" | "poweroff-force" | "poweroff-immediate" | "exit" | "exit-force" | "soft-reboot" | "soft-reboot-force" | "kexec" | "kexec-force" | "halt" | "halt-force" | "halt-immediate" | string;
	/**
	 * Controls the exit status to propagate back to an invoking container manager (in case of a system service) or service manager (in case of a user manager) when the
	 *
	 * FailureAction=/SuccessAction= are set to exit or exit-force and the action is triggered. By default the exit status of the main process of the triggering unit (if
	 *
	 * this applies) is propagated. Takes a value in the range 0...255 or the empty string to request default behaviour.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureActionExitStatus=
	 */
	FailureActionExitStatus: MaybeArray<string>;
	/**
	 * Controls the exit status to propagate back to an invoking container manager (in case of a system service) or service manager (in case of a user manager) when the
	 *
	 * FailureAction=/SuccessAction= are set to exit or exit-force and the action is triggered. By default the exit status of the main process of the triggering unit (if
	 *
	 * this applies) is propagated. Takes a value in the range 0...255 or the empty string to request default behaviour.
	 *
	 * Added in version 240.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#FailureActionExitStatus=
	 */
	SuccessActionExitStatus: MaybeArray<string>;
	/**
	 * JobTimeoutSec= specifies a timeout for the whole job that starts running when the job is queued.  JobRunningTimeoutSec= specifies a timeout that starts running when
	 *
	 * the queued job is actually started. If either limit is reached, the job will be cancelled, the unit however will not change state or even enter the "failed" mode.
	 *
	 * Both settings take a time span with the default unit of seconds, but other units may be specified, see systemd.time(5). The default is "infinity" (job timeouts
	 *
	 * disabled), except for device units where JobRunningTimeoutSec= defaults to DefaultDeviceTimeoutSec=.
	 *
	 * Note: these timeouts are independent from any unit-specific timeouts (for example, the timeout set with TimeoutStartSec= in service units). The job timeout has no
	 *
	 * effect on the unit itself. Or in other words: unit-specific timeouts are useful to abort unit state changes, and revert them. The job timeout set with this option
	 *
	 * however is useful to abort only the job waiting for the unit state to change.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutSec=
	 */
	JobTimeoutSec: string | number;
	/**
	 * JobTimeoutSec= specifies a timeout for the whole job that starts running when the job is queued.  JobRunningTimeoutSec= specifies a timeout that starts running when
	 *
	 * the queued job is actually started. If either limit is reached, the job will be cancelled, the unit however will not change state or even enter the "failed" mode.
	 *
	 * Both settings take a time span with the default unit of seconds, but other units may be specified, see systemd.time(5). The default is "infinity" (job timeouts
	 *
	 * disabled), except for device units where JobRunningTimeoutSec= defaults to DefaultDeviceTimeoutSec=.
	 *
	 * Note: these timeouts are independent from any unit-specific timeouts (for example, the timeout set with TimeoutStartSec= in service units). The job timeout has no
	 *
	 * effect on the unit itself. Or in other words: unit-specific timeouts are useful to abort unit state changes, and revert them. The job timeout set with this option
	 *
	 * however is useful to abort only the job waiting for the unit state to change.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutSec=
	 */
	JobRunningTimeoutSec: string | number;
	/**
	 * JobTimeoutAction= optionally configures an additional action to take when the timeout is hit, see description of JobTimeoutSec= and JobRunningTimeoutSec= above. It
	 *
	 * takes the same values as StartLimitAction=. Defaults to none.
	 *
	 * JobTimeoutRebootArgument= configures an optional reboot string to pass to the reboot(2) system call.
	 *
	 * Added in version 240.
	 *
	 * StartLimitIntervalSec=interval, StartLimitBurst=burst
	 *
	 * Configure unit start rate limiting. Units which are started more than burst times within an interval time span are not permitted to start any more. Use
	 *
	 * StartLimitIntervalSec= to configure the checking interval and StartLimitBurst= to configure how many starts per interval are allowed.
	 *
	 * interval is a time span with the default unit of seconds, but other units may be specified, see systemd.time(5). The special value "infinity" can be used to limit
	 *
	 * the total number of start attempts, even if they happen at large time intervals. Defaults to DefaultStartLimitIntervalSec= in manager configuration file, and may be
	 *
	 * set to 0 to disable any kind of rate limiting.  burst is a number and defaults to DefaultStartLimitBurst= in manager configuration file.
	 *
	 * These configuration options are particularly useful in conjunction with the service setting Restart= (see systemd.service(5)); however, they apply to all kinds of
	 *
	 * starts (including manual), not just those triggered by the Restart= logic.
	 *
	 * Note that units which are configured for Restart=, and which reach the start limit are not attempted to be restarted anymore; however, they may still be restarted
	 *
	 * manually or from a timer or socket at a later point, after the interval has passed. From that point on, the restart logic is activated again.  systemctl
	 *
	 * reset-failed will cause the restart rate counter for a service to be flushed, which is useful if the administrator wants to manually start a unit and the start
	 *
	 * limit interferes with that. Rate-limiting is enforced after any unit condition checks are executed, and hence unit activations with failing conditions do not count
	 *
	 * towards the rate limit.
	 *
	 * When a unit is unloaded due to the garbage collection logic (see above) its rate limit counters are flushed out too. This means that configuring start rate limiting
	 *
	 * for a unit that is not referenced continuously has no effect.
	 *
	 * This setting does not apply to slice, target, device, and scope units, since they are unit types whose activation may either never fail, or may succeed only a
	 *
	 * single time.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutAction=
	 */
	JobTimeoutAction: string | number;
	/**
	 * JobTimeoutAction= optionally configures an additional action to take when the timeout is hit, see description of JobTimeoutSec= and JobRunningTimeoutSec= above. It
	 *
	 * takes the same values as StartLimitAction=. Defaults to none.
	 *
	 * JobTimeoutRebootArgument= configures an optional reboot string to pass to the reboot(2) system call.
	 *
	 * Added in version 240.
	 *
	 * StartLimitIntervalSec=interval, StartLimitBurst=burst
	 *
	 * Configure unit start rate limiting. Units which are started more than burst times within an interval time span are not permitted to start any more. Use
	 *
	 * StartLimitIntervalSec= to configure the checking interval and StartLimitBurst= to configure how many starts per interval are allowed.
	 *
	 * interval is a time span with the default unit of seconds, but other units may be specified, see systemd.time(5). The special value "infinity" can be used to limit
	 *
	 * the total number of start attempts, even if they happen at large time intervals. Defaults to DefaultStartLimitIntervalSec= in manager configuration file, and may be
	 *
	 * set to 0 to disable any kind of rate limiting.  burst is a number and defaults to DefaultStartLimitBurst= in manager configuration file.
	 *
	 * These configuration options are particularly useful in conjunction with the service setting Restart= (see systemd.service(5)); however, they apply to all kinds of
	 *
	 * starts (including manual), not just those triggered by the Restart= logic.
	 *
	 * Note that units which are configured for Restart=, and which reach the start limit are not attempted to be restarted anymore; however, they may still be restarted
	 *
	 * manually or from a timer or socket at a later point, after the interval has passed. From that point on, the restart logic is activated again.  systemctl
	 *
	 * reset-failed will cause the restart rate counter for a service to be flushed, which is useful if the administrator wants to manually start a unit and the start
	 *
	 * limit interferes with that. Rate-limiting is enforced after any unit condition checks are executed, and hence unit activations with failing conditions do not count
	 *
	 * towards the rate limit.
	 *
	 * When a unit is unloaded due to the garbage collection logic (see above) its rate limit counters are flushed out too. This means that configuring start rate limiting
	 *
	 * for a unit that is not referenced continuously has no effect.
	 *
	 * This setting does not apply to slice, target, device, and scope units, since they are unit types whose activation may either never fail, or may succeed only a
	 *
	 * single time.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#JobTimeoutAction=
	 */
	JobTimeoutRebootArgument: string | number;
	/**
	 * Configure an additional action to take if the rate limit configured with StartLimitIntervalSec= and StartLimitBurst= is hit. Takes the same values as the
	 *
	 * FailureAction=/SuccessAction= settings. If none is set, hitting the rate limit will trigger no action except that the start will not be permitted. Defaults to none.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#StartLimitAction=
	 */
	StartLimitAction: MaybeArray<string>;
	/**
	 * Configure the optional argument for the reboot(2) system call if StartLimitAction= or FailureAction= is a reboot action. This works just like the optional argument
	 *
	 * to systemctl reboot command.
	 *
	 * Added in version 229.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#RebootArgument=
	 */
	RebootArgument: MaybeArray<string>;
	/**
	 * A path to a configuration file this unit has been generated from. This is primarily useful for implementation of generator tools that convert configuration from an
	 *
	 * external configuration file format into native unit files. This functionality should not be used in normal units.
	 *
	 * Added in version 201.
	 *
	 * Conditions and Asserts
	 *
	 * Unit files may also include a number of Condition...= and Assert...= settings. Before the unit is started, systemd will verify that the specified conditions and asserts
	 *
	 * are true. If not, the starting of the unit will be (mostly silently) skipped (in case of conditions), or aborted with an error message (in case of asserts). Failing
	 *
	 * conditions or asserts will not result in the unit being moved into the "failed" state. The conditions and asserts are checked at the time the queued start job is to be
	 *
	 * executed. The ordering dependencies are still respected, so other units are still pulled in and ordered as if this unit was successfully activated, and the conditions
	 *
	 * and asserts are executed the precise moment the unit would normally start and thus can validate system state after the units ordered before completed initialization.
	 *
	 * Use condition expressions for skipping units that do not apply to the local system, for example because the kernel or runtime environment doesn't require their
	 *
	 * functionality.
	 *
	 * If multiple conditions are specified, the unit will be executed if all of them apply (i.e. a logical AND is applied). Condition checks can use a pipe symbol ("|") after
	 *
	 * the equals sign ("Condition...=|..."), which causes the condition to become a triggering condition. If at least one triggering condition is defined for a unit, then the
	 *
	 * unit will be started if at least one of the triggering conditions of the unit applies and all of the regular (i.e. non-triggering) conditions apply. If you prefix an
	 *
	 * argument with the pipe symbol and an exclamation mark, the pipe symbol must be passed first, the exclamation second. If any of these options is assigned the empty
	 *
	 * string, the list of conditions is reset completely, all previous condition settings (of any kind) will have no effect.
	 *
	 * The AssertArchitecture=, AssertVirtualization=, ... options are similar to conditions but cause the start job to fail (instead of being skipped). The failed check is
	 *
	 * logged. Units with unmet conditions are considered to be in a clean state and will be garbage collected if they are not referenced. This means that when queried, the
	 *
	 * condition failure may or may not show up in the state of the unit.
	 *
	 * Note that neither assertion nor condition expressions result in unit state changes. Also note that both are checked at the time the job is to be executed, i.e. long
	 *
	 * after depending jobs and it itself were queued. Thus, neither condition nor assertion expressions are suitable for conditionalizing unit dependencies.
	 *
	 * The condition verb of systemd-analyze(1) can be used to test condition and assert expressions.
	 *
	 * Except for ConditionPathIsSymbolicLink=, all path checks follow symlinks.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#SourcePath=
	 */
	SourcePath: MaybeArray<string>;
	/**
	 * Check whether the system is running on a specific architecture. Takes one of "x86", "x86-64", "ppc", "ppc-le", "ppc64", "ppc64-le", "ia64", "parisc", "parisc64",
	 *
	 * "s390", "s390x", "sparc", "sparc64", "mips", "mips-le", "mips64", "mips64-le", "alpha", "arm", "arm-be", "arm64", "arm64-be", "sh", "sh64", "m68k", "tilegx",
	 *
	 * "cris", "arc", "arc-be", or "native".
	 *
	 * The architecture is determined from the information returned by uname(2) and is thus subject to personality(2). Note that a Personality= setting in the same unit
	 *
	 * file has no effect on this condition. A special architecture name "native" is mapped to the architecture the system manager itself is compiled for. The test may be
	 *
	 * negated by prepending an exclamation mark.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionArchitecture=
	 */
	ConditionArchitecture: "x86" | "x86-64" | "ppc" | "ppc-le" | "ppc64" | "ppc64-le" | "ia64" | "parisc" | "parisc64" | "s390" | "s390x" | "sparc" | "sparc64" | "mips" | "mips-le" | "mips64" | "mips64-le" | "alpha" | "arm" | "arm-be" | "arm64" | "arm64-be" | "sh" | "sh64" | "m68k" | "tilegx" | "cris" | "arc" | "arc-be" | "native" | string;
	/**
	 * Check whether the system's firmware is of a certain type. The following values are possible:
	 *
	 * •   "uefi" matches systems with EFI.
	 *
	 * •   "device-tree" matches systems with a device tree.
	 *
	 * •   "device-tree-compatible(value)" matches systems with a device tree that are compatible with "value".
	 *
	 * •   "smbios-field(field operator value)" matches systems with a SMBIOS field containing a certain value.  field is the name of the SMBIOS field exposed as "sysfs"
	 *
	 * attribute file below /sys/class/dmi/id/.  operator is one of "<", "<=", ">=", ">", "==", "<>" for version comparisons, "=" and "!=" for literal string
	 *
	 * comparisons, or "$=", "!$=" for shell-style glob comparisons.  value is the expected value of the SMBIOS field value (possibly containing shell style globs in
	 *
	 * case "$="/"!$=" is used).
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFirmware=
	 */
	ConditionFirmware: MaybeArray<string>;
	/**
	 * Check whether the system is executed in a virtualized environment and optionally test whether it is a specific implementation. Takes either boolean value to check
	 *
	 * if being executed in any virtualized environment, or one of "vm" and "container" to test against a generic type of virtualization solution, or one of "qemu", "kvm",
	 *
	 * "amazon", "zvm", "vmware", "microsoft", "oracle", "powervm", "xen", "bochs", "uml", "bhyve", "qnx", "apple", "sre", "openvz", "lxc", "lxc-libvirt",
	 *
	 * "systemd-nspawn", "docker", "podman", "rkt", "wsl", "proot", "pouch", "acrn" to test against a specific implementation, or "private-users" to check whether we are
	 *
	 * running in a user namespace. See systemd-detect-virt(1) for a full list of known virtualization technologies and their identifiers. If multiple virtualization
	 *
	 * technologies are nested, only the innermost is considered. The test may be negated by prepending an exclamation mark.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionVirtualization=
	 */
	ConditionVirtualization: MaybeArray<string>;
	/**
	 * ConditionHost= may be used to match against the hostname or machine ID of the host. This either takes a hostname string (optionally with shell style globs) which is
	 *
	 * tested against the locally set hostname as returned by gethostname(2), or a machine ID formatted as string (see machine-id(5)). The test may be negated by
	 *
	 * prepending an exclamation mark.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionHost=
	 */
	ConditionHost: MaybeArray<string>;
	/**
	 * ConditionKernelCommandLine= may be used to check whether a specific kernel command line option is set (or if prefixed with the exclamation mark — unset). The
	 *
	 * argument must either be a single word, or an assignment (i.e. two words, separated by "="). In the former case the kernel command line is searched for the word
	 *
	 * appearing as is, or as left hand side of an assignment. In the latter case, the exact assignment is looked for with right and left hand side matching. This operates
	 *
	 * on the kernel command line communicated to userspace via /proc/cmdline, except when the service manager is invoked as payload of a container manager, in which case
	 *
	 * the command line of PID 1 is used instead (i.e.  /proc/1/cmdline).
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionKernelCommandLine=
	 */
	ConditionKernelCommandLine: MaybeArray<string>;
	/**
	 * ConditionKernelVersion= may be used to check whether the kernel version (as reported by uname -r) matches a certain expression, or if prefixed with the exclamation
	 *
	 * mark, does not match. The argument must be a list of (potentially quoted) expressions. Each expression starts with one of "=" or "!=" for string comparisons, "<",
	 *
	 * "<=", "==", "<>", ">=", ">" for version comparisons, or "$=", "!$=" for a shell-style glob match. If no operator is specified, "$=" is implied.
	 *
	 * Note that using the kernel version string is an unreliable way to determine which features are supported by a kernel, because of the widespread practice of
	 *
	 * backporting drivers, features, and fixes from newer upstream kernels into older versions provided by distributions. Hence, this check is inherently unportable and
	 *
	 * should not be used for units which may be used on different distributions.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionKernelVersion=
	 */
	ConditionKernelVersion: MaybeArray<string>;
	/**
	 * ConditionCredential= may be used to check whether a credential by the specified name was passed into the service manager. See System and Service Credentials[3] for
	 *
	 * details about credentials. If used in services for the system service manager this may be used to conditionalize services based on system credentials passed in. If
	 *
	 * used in services for the per-user service manager this may be used to conditionalize services based on credentials passed into the unit@.service service instance
	 *
	 * belonging to the user. The argument must be a valid credential name.
	 *
	 * Added in version 252.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCredential=
	 */
	ConditionCredential: MaybeArray<string>;
	/**
	 * ConditionEnvironment= may be used to check whether a specific environment variable is set (or if prefixed with the exclamation mark — unset) in the service
	 *
	 * manager's environment block. The argument may be a single word, to check if the variable with this name is defined in the environment block, or an assignment
	 *
	 * ("name=value"), to check if the variable with this exact value is defined. Note that the environment block of the service manager itself is checked, i.e. not any
	 *
	 * variables defined with Environment= or EnvironmentFile=, as described above. This is particularly useful when the service manager runs inside a containerized
	 *
	 * environment or as per-user service manager, in order to check for variables passed in by the enclosing container manager or PAM.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionEnvironment=
	 */
	ConditionEnvironment: MaybeArray<string>;
	/**
	 * ConditionSecurity= may be used to check whether the given security technology is enabled on the system. Currently, the following values are recognized:
	 *
	 * Table 3. Recognized security technologies
	 *
	 * ┌─────────────────┬───────────────────────────────────────────────────────┐
	 * │ Value           │ Description                                           │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ selinux         │ SELinux MAC                                           │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ apparmor        │ AppArmor MAC                                          │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ tomoyo          │ Tomoyo MAC                                            │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ smack           │ SMACK MAC                                             │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ ima             │ Integrity Measurement Architecture (IMA)              │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ audit           │ Linux Audit Framework                                 │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ uefi-secureboot │ UEFI SecureBoot                                       │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ tpm2            │ Trusted Platform Module 2.0 (TPM2)                    │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ cvm             │ Confidential virtual machine (SEV/TDX)                │
	 * ├─────────────────┼───────────────────────────────────────────────────────┤
	 * │ measured-uki    │ Unified Kernel Image with PCR 11 Measurements, as per │
	 * │                 │ systemd-stub(7). Added in version 255.                │
	 * └─────────────────┴───────────────────────────────────────────────────────┘
	 * The test may be negated by prepending an exclamation mark.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionSecurity=
	 */
	ConditionSecurity: MaybeArray<string>;
	/**
	 * Check whether the given capability exists in the capability bounding set of the service manager (i.e. this does not check whether capability is actually available
	 *
	 * in the permitted or effective sets, see capabilities(7) for details). Pass a capability name such as "CAP_MKNOD", possibly prefixed with an exclamation mark to
	 *
	 * negate the check.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCapability=
	 */
	ConditionCapability: MaybeArray<string>;
	/**
	 * Check whether the system has AC power, or is exclusively battery powered at the time of activation of the unit. This takes a boolean argument. If set to "true", the
	 *
	 * condition will hold only if at least one AC connector of the system is connected to a power source, or if no AC connectors are known. Conversely, if set to "false",
	 *
	 * the condition will hold only if there is at least one AC connector known and all AC connectors are disconnected from a power source.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionACPower=
	 */
	ConditionACPower: MaybeArray<string>;
	/**
	 * Takes one of /var/ or /etc/ as argument, possibly prefixed with a "!"  (to invert the condition). This condition may be used to conditionalize units on whether the
	 *
	 * specified directory requires an update because /usr/'s modification time is newer than the stamp file .updated in the specified directory. This is useful to
	 *
	 * implement offline updates of the vendor operating system resources in /usr/ that require updating of /etc/ or /var/ on the next following boot. Units making use of
	 *
	 * this condition should order themselves before systemd-update-done.service(8), to make sure they run before the stamp file's modification time gets reset indicating
	 *
	 * a completed update.
	 *
	 * If the systemd.condition-needs-update= option is specified on the kernel command line (taking a boolean), it will override the result of this condition check,
	 *
	 * taking precedence over any file modification time checks. If the kernel command line option is used, systemd-update-done.service will not have immediate effect on
	 *
	 * any following ConditionNeedsUpdate= checks, until the system is rebooted where the kernel command line option is not specified anymore.
	 *
	 * Note that to make this scheme effective, the timestamp of /usr/ should be explicitly updated after its contents are modified. The kernel will automatically update
	 *
	 * modification timestamp on a directory only when immediate children of a directory are modified; an modification of nested files will not automatically result in
	 *
	 * mtime of /usr/ being updated.
	 *
	 * Also note that if the update method includes a call to execute appropriate post-update steps itself, it should not touch the timestamp of /usr/. In a typical
	 *
	 * distribution packaging scheme, packages will do any required update steps as part of the installation or upgrade, to make package contents immediately usable.
	 *
	 * ConditionNeedsUpdate= should be used with other update mechanisms where such an immediate update does not happen.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionNeedsUpdate=
	 */
	ConditionNeedsUpdate: "/var/" | "/etc/" | "as" | "argument" | "possibly" | "prefixed" | "with" | "a" | "!" | string;
	/**
	 * Takes a boolean argument. This condition may be used to conditionalize units on whether the system is booting up for the first time. This roughly means that /etc/
	 *
	 * was unpopulated when the system started booting (for details, see "First Boot Semantics" in machine-id(5)). First boot is considered finished (this condition will
	 *
	 * evaluate as false) after the manager has finished the startup phase.
	 *
	 * This condition may be used to populate /etc/ on the first boot after factory reset, or when a new system instance boots up for the first time.
	 *
	 * For robustness, units with ConditionFirstBoot=yes should order themselves before first-boot-complete.target and pull in this passive target with Wants=. This
	 *
	 * ensures that in a case of an aborted first boot, these units will be re-run during the next system startup.
	 *
	 * If the systemd.condition-first-boot= option is specified on the kernel command line (taking a boolean), it will override the result of this condition check, taking
	 *
	 * precedence over /etc/machine-id existence checks.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFirstBoot=
	 */
	ConditionFirstBoot: MaybeArray<string>;
	/**
	 * Check for the existence of a file. If the specified absolute path name does not exist, the condition will fail. If the absolute path name passed to
	 *
	 * ConditionPathExists= is prefixed with an exclamation mark ("!"), the test is negated, and the unit is only started if the path does not exist.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathExists=
	 */
	ConditionPathExists: MaybeArray<string>;
	/**
	 * ConditionPathExistsGlob= is similar to ConditionPathExists=, but checks for the existence of at least one file or directory matching the specified globbing pattern.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathExistsGlob=
	 */
	ConditionPathExistsGlob: MaybeArray<string>;
	/**
	 * ConditionPathIsDirectory= is similar to ConditionPathExists= but verifies that a certain path exists and is a directory.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsDirectory=
	 */
	ConditionPathIsDirectory: MaybeArray<string>;
	/**
	 * ConditionPathIsSymbolicLink= is similar to ConditionPathExists= but verifies that a certain path exists and is a symbolic link.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsSymbolicLink=
	 */
	ConditionPathIsSymbolicLink: MaybeArray<string>;
	/**
	 * ConditionPathIsMountPoint= is similar to ConditionPathExists= but verifies that a certain path exists and is a mount point.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsMountPoint=
	 */
	ConditionPathIsMountPoint: MaybeArray<string>;
	/**
	 * ConditionPathIsReadWrite= is similar to ConditionPathExists= but verifies that the underlying file system is readable and writable (i.e. not mounted read-only).
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsReadWrite=
	 */
	ConditionPathIsReadWrite: MaybeArray<string>;
	/**
	 * ConditionPathIsEncrypted= is similar to ConditionPathExists= but verifies that the underlying file system's backing block device is encrypted using dm-crypt/LUKS.
	 *
	 * Note that this check does not cover ext4 per-directory encryption, and only detects block level encryption. Moreover, if the specified path resides on a file system
	 *
	 * on top of a loopback block device, only encryption above the loopback device is detected. It is not detected whether the file system backing the loopback block
	 *
	 * device is encrypted.
	 *
	 * Added in version 246.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionPathIsEncrypted=
	 */
	ConditionPathIsEncrypted: MaybeArray<string>;
	/**
	 * ConditionDirectoryNotEmpty= is similar to ConditionPathExists= but verifies that a certain path exists and is a non-empty directory.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionDirectoryNotEmpty=
	 */
	ConditionDirectoryNotEmpty: MaybeArray<string>;
	/**
	 * ConditionFileNotEmpty= is similar to ConditionPathExists= but verifies that a certain path exists and refers to a regular file with a non-zero size.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFileNotEmpty=
	 */
	ConditionFileNotEmpty: MaybeArray<string>;
	/**
	 * ConditionFileIsExecutable= is similar to ConditionPathExists= but verifies that a certain path exists, is a regular file, and marked executable.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionFileIsExecutable=
	 */
	ConditionFileIsExecutable: MaybeArray<string>;
	/**
	 * ConditionUser= takes a numeric "UID", a UNIX user name, or the special value "@system". This condition may be used to check whether the service manager is running
	 *
	 * as the given user. The special value "@system" can be used to check if the user id is within the system user range. This option is not useful for system services,
	 *
	 * as the system manager exclusively runs as the root user, and thus the test result is constant.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionUser=
	 */
	ConditionUser: MaybeArray<string>;
	/**
	 * ConditionGroup= is similar to ConditionUser= but verifies that the service manager's real or effective group, or any of its auxiliary groups, match the specified
	 *
	 * group or GID. This setting does not support the special value "@system".
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionGroup=
	 */
	ConditionGroup: MaybeArray<string>;
	/**
	 * Check whether given cgroup controllers (e.g.  "cpu") are available for use on the system or whether the legacy v1 cgroup or the modern v2 cgroup hierarchy is used.
	 *
	 * Multiple controllers may be passed with a space separating them; in this case the condition will only pass if all listed controllers are available for use.
	 *
	 * Controllers unknown to systemd are ignored. Valid controllers are "cpu", "io", "memory", and "pids". Even if available in the kernel, a particular controller may
	 *
	 * not be available if it was disabled on the kernel command line with cgroup_disable=controller.
	 *
	 * Alternatively, two special strings "v1" and "v2" may be specified (without any controller names).  "v2" will pass if the unified v2 cgroup hierarchy is used, and
	 *
	 * "v1" will pass if the legacy v1 hierarchy or the hybrid hierarchy are used. Note that legacy or hybrid hierarchies have been deprecated. See systemd(1) for more
	 *
	 * information.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionControlGroupController=
	 */
	ConditionControlGroupController: MaybeArray<string>;
	/**
	 * Verify that the specified amount of system memory is available to the current system. Takes a memory size in bytes as argument, optionally prefixed with a
	 *
	 * comparison operator "<", "<=", "=" (or "=="), "!=" (or "<>"), ">=", ">". On bare-metal systems compares the amount of physical memory in the system with the
	 *
	 * specified size, adhering to the specified comparison operator. In containers compares the amount of memory assigned to the container instead.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemory=
	 */
	ConditionMemory: MaybeArray<string>;
	/**
	 * Verify that the specified number of CPUs is available to the current system. Takes a number of CPUs as argument, optionally prefixed with a comparison operator "<",
	 *
	 * "<=", "=" (or "=="), "!=" (or "<>"), ">=", ">". Compares the number of CPUs in the CPU affinity mask configured of the service manager itself with the specified
	 *
	 * number, adhering to the specified comparison operator. On physical systems the number of CPUs in the affinity mask of the service manager usually matches the number
	 *
	 * of physical CPUs, but in special and virtual environments might differ. In particular, in containers the affinity mask usually matches the number of CPUs assigned
	 *
	 * to the container and not the physically available ones.
	 *
	 * Added in version 244.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCPUs=
	 */
	ConditionCPUs: MaybeArray<string>;
	/**
	 * Verify that a given CPU feature is available via the "CPUID" instruction. This condition only does something on i386 and x86-64 processors. On other processors it
	 *
	 * is assumed that the CPU does not support the given feature. It checks the leaves "1", "7", "0x80000001", and "0x80000007". Valid values are: "fpu", "vme", "de",
	 *
	 * "pse", "tsc", "msr", "pae", "mce", "cx8", "apic", "sep", "mtrr", "pge", "mca", "cmov", "pat", "pse36", "clflush", "mmx", "fxsr", "sse", "sse2", "ht", "pni",
	 *
	 * "pclmul", "monitor", "ssse3", "fma3", "cx16", "sse4_1", "sse4_2", "movbe", "popcnt", "aes", "xsave", "osxsave", "avx", "f16c", "rdrand", "bmi1", "avx2", "bmi2",
	 *
	 * "rdseed", "adx", "sha_ni", "syscall", "rdtscp", "lm", "lahf_lm", "abm", "constant_tsc".
	 *
	 * Added in version 248.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionCPUFeature=
	 */
	ConditionCPUFeature: MaybeArray<string>;
	/**
	 * Verify that a specific "key=value" pair is set in the host's os-release(5).
	 *
	 * Other than exact string matching (with "=" and "!="), relative comparisons are supported for versioned parameters (e.g.  "VERSION_ID"; with "<", "<=", "==", "<>",
	 *
	 * ">=", ">"), and shell-style wildcard comparisons ("*", "?", "[]") are supported with the "$=" (match) and "!$=" (non-match).
	 *
	 * If the given key is not found in the file, the match is done against an empty value.
	 *
	 * Added in version 249.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionOSRelease=
	 */
	ConditionOSRelease: MaybeArray<string>;
	/**
	 * Verify that the overall system (memory, CPU or IO) pressure is below or equal to a threshold. This setting takes a threshold value as argument. It can be specified
	 *
	 * as a simple percentage value, suffixed with "%", in which case the pressure will be measured as an average over the last five minutes before the attempt to start
	 *
	 * the unit is performed. Alternatively, the average timespan can also be specified using "/" as a separator, for example: "10%/1min". The supported timespans match
	 *
	 * what the kernel provides, and are limited to "10sec", "1min" and "5min". The "full" PSI will be checked first, and if not found "some" will be checked. For more
	 *
	 * details, see the documentation on PSI (Pressure Stall Information)[4].
	 *
	 * Optionally, the threshold value can be prefixed with the slice unit under which the pressure will be checked, followed by a ":". If the slice unit is not specified,
	 *
	 * the overall system pressure will be measured, instead of a particular cgroup's.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemoryPressure=
	 */
	ConditionMemoryPressure: MaybeArray<string>;
	/**
	 * Verify that the overall system (memory, CPU or IO) pressure is below or equal to a threshold. This setting takes a threshold value as argument. It can be specified
	 *
	 * as a simple percentage value, suffixed with "%", in which case the pressure will be measured as an average over the last five minutes before the attempt to start
	 *
	 * the unit is performed. Alternatively, the average timespan can also be specified using "/" as a separator, for example: "10%/1min". The supported timespans match
	 *
	 * what the kernel provides, and are limited to "10sec", "1min" and "5min". The "full" PSI will be checked first, and if not found "some" will be checked. For more
	 *
	 * details, see the documentation on PSI (Pressure Stall Information)[4].
	 *
	 * Optionally, the threshold value can be prefixed with the slice unit under which the pressure will be checked, followed by a ":". If the slice unit is not specified,
	 *
	 * the overall system pressure will be measured, instead of a particular cgroup's.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemoryPressure=
	 */
	ConditionCPUPressure: MaybeArray<string>;
	/**
	 * Verify that the overall system (memory, CPU or IO) pressure is below or equal to a threshold. This setting takes a threshold value as argument. It can be specified
	 *
	 * as a simple percentage value, suffixed with "%", in which case the pressure will be measured as an average over the last five minutes before the attempt to start
	 *
	 * the unit is performed. Alternatively, the average timespan can also be specified using "/" as a separator, for example: "10%/1min". The supported timespans match
	 *
	 * what the kernel provides, and are limited to "10sec", "1min" and "5min". The "full" PSI will be checked first, and if not found "some" will be checked. For more
	 *
	 * details, see the documentation on PSI (Pressure Stall Information)[4].
	 *
	 * Optionally, the threshold value can be prefixed with the slice unit under which the pressure will be checked, followed by a ":". If the slice unit is not specified,
	 *
	 * the overall system pressure will be measured, instead of a particular cgroup's.
	 *
	 * Added in version 250.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#ConditionMemoryPressure=
	 */
	ConditionIOPressure: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertArchitecture: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertVirtualization: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertHost: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertKernelCommandLine: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertKernelVersion: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertCredential: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertEnvironment: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertSecurity: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertCapability: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertACPower: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertNeedsUpdate: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertFirstBoot: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathExists: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathExistsGlob: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathIsDirectory: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathIsSymbolicLink: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathIsMountPoint: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathIsReadWrite: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertPathIsEncrypted: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertDirectoryNotEmpty: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertFileNotEmpty: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertFileIsExecutable: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertUser: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertGroup: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertControlGroupController: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertMemory: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertCPUs: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertCPUFeature: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertOSRelease: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertMemoryPressure: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertCPUPressure: MaybeArray<string>;
	/**
	 * Similar to the ConditionArchitecture=, ConditionVirtualization=, ..., condition settings described above, these settings add assertion checks to the start-up of the
	 *
	 * unit. However, unlike the conditions settings, any assertion setting that is not met results in failure of the start job (which means this is logged loudly). Note
	 *
	 * that hitting a configured assertion does not cause the unit to enter the "failed" state (or in fact result in any state change of the unit), it affects only the job
	 *
	 * queued for it. Use assertion expressions for units that cannot operate when specific requirements are not met, and when this is something the administrator or user
	 *
	 * should look into.
	 *
	 * Added in version 218.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#AssertArchitecture=
	 */
	AssertIOPressure: MaybeArray<string>;
}
/**
 * Unit files may include an [Install] section, which carries installation information for the unit. This section is not interpreted by systemd(1) during runtime; it is
 *
 * used by the enable and disable commands of the systemctl(1) tool during installation of a unit.
 *
 */
export interface IUnitInstallOptions {
	/**
	 * A space-separated list of additional names this unit shall be installed under. The names listed here must have the same suffix (i.e. type) as the unit filename.
	 *
	 * This option may be specified more than once, in which case all listed names are used. At installation time, systemctl enable will create symlinks from these names
	 *
	 * to the unit filename. Note that not all unit types support such alias names, and this setting is not supported for them. Specifically, mount, slice, swap, and
	 *
	 * automount units do not support aliasing.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Alias=
	 */
	Alias: MaybeArray<string>;
	/**
	 * This option may be used more than once, or a space-separated list of unit names may be given. A symbolic link is created in the .wants/, .requires/, or .upholds/
	 *
	 * directory of each of the listed units when this unit is installed by systemctl enable. This has the effect of a dependency of type Wants=, Requires=, or Upholds=
	 *
	 * being added from the listed unit to the current unit. See the description of the mentioned dependency types in the [Unit] section for details.
	 *
	 * In case of template units listing non template units, the listing unit must have DefaultInstance= set, or systemctl enable must be called with an instance name. The
	 *
	 * instance (default or specified) will be added to the .wants/, .requires/, or .upholds/ list of the listed unit. For example, WantedBy=getty.target in a service
	 *
	 * getty@.service will result in systemctl enable getty@tty2.service creating a getty.target.wants/getty@tty2.service link to getty@.service. This also applies to
	 *
	 * listing specific instances of templated units: this specific instance will gain the dependency. A template unit may also list a template unit, in which case a
	 *
	 * generic dependency will be added where each instance of the listing unit will have a dependency on an instance of the listed template with the same instance value.
	 *
	 * For example, WantedBy=container@.target in a service monitor@.service will result in systemctl enable monitor@.service creating a
	 *
	 * container@.target.wants/monitor@.service link to monitor@.service, which applies to all instances of container@.target.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#WantedBy=
	 */
	WantedBy: MaybeArray<string>;
	/**
	 * This option may be used more than once, or a space-separated list of unit names may be given. A symbolic link is created in the .wants/, .requires/, or .upholds/
	 *
	 * directory of each of the listed units when this unit is installed by systemctl enable. This has the effect of a dependency of type Wants=, Requires=, or Upholds=
	 *
	 * being added from the listed unit to the current unit. See the description of the mentioned dependency types in the [Unit] section for details.
	 *
	 * In case of template units listing non template units, the listing unit must have DefaultInstance= set, or systemctl enable must be called with an instance name. The
	 *
	 * instance (default or specified) will be added to the .wants/, .requires/, or .upholds/ list of the listed unit. For example, WantedBy=getty.target in a service
	 *
	 * getty@.service will result in systemctl enable getty@tty2.service creating a getty.target.wants/getty@tty2.service link to getty@.service. This also applies to
	 *
	 * listing specific instances of templated units: this specific instance will gain the dependency. A template unit may also list a template unit, in which case a
	 *
	 * generic dependency will be added where each instance of the listing unit will have a dependency on an instance of the listed template with the same instance value.
	 *
	 * For example, WantedBy=container@.target in a service monitor@.service will result in systemctl enable monitor@.service creating a
	 *
	 * container@.target.wants/monitor@.service link to monitor@.service, which applies to all instances of container@.target.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#WantedBy=
	 */
	RequiredBy: MaybeArray<string>;
	/**
	 * This option may be used more than once, or a space-separated list of unit names may be given. A symbolic link is created in the .wants/, .requires/, or .upholds/
	 *
	 * directory of each of the listed units when this unit is installed by systemctl enable. This has the effect of a dependency of type Wants=, Requires=, or Upholds=
	 *
	 * being added from the listed unit to the current unit. See the description of the mentioned dependency types in the [Unit] section for details.
	 *
	 * In case of template units listing non template units, the listing unit must have DefaultInstance= set, or systemctl enable must be called with an instance name. The
	 *
	 * instance (default or specified) will be added to the .wants/, .requires/, or .upholds/ list of the listed unit. For example, WantedBy=getty.target in a service
	 *
	 * getty@.service will result in systemctl enable getty@tty2.service creating a getty.target.wants/getty@tty2.service link to getty@.service. This also applies to
	 *
	 * listing specific instances of templated units: this specific instance will gain the dependency. A template unit may also list a template unit, in which case a
	 *
	 * generic dependency will be added where each instance of the listing unit will have a dependency on an instance of the listed template with the same instance value.
	 *
	 * For example, WantedBy=container@.target in a service monitor@.service will result in systemctl enable monitor@.service creating a
	 *
	 * container@.target.wants/monitor@.service link to monitor@.service, which applies to all instances of container@.target.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#WantedBy=
	 */
	UpheldBy: MaybeArray<string>;
	/**
	 * Additional units to install/deinstall when this unit is installed/deinstalled. If the user requests installation/deinstallation of a unit with this option
	 *
	 * configured, systemctl enable and systemctl disable will automatically install/uninstall units listed in this option as well.
	 *
	 * This option may be used more than once, or a space-separated list of unit names may be given.
	 *
	 * Added in version 201.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#Also=
	 */
	Also: MaybeArray<string>;
	/**
	 * In template unit files, this specifies for which instance the unit shall be enabled if the template is enabled without any explicitly set instance. This option has
	 *
	 * no effect in non-template unit files. The specified string must be usable as instance identifier.
	 *
	 * Added in version 215.
	 *
	 * The following specifiers are interpreted in the Install section: %a, %b, %B, %g, %G, %H, %i, %j, %l, %m, %n, %N, %o, %p, %u, %U, %v, %w, %W, %%. For their meaning see
	 *
	 * the next section.
	 *
	 * @see https://www.freedesktop.org/software/systemd/man/systemd.unit.html#DefaultInstance=
	 */
	DefaultInstance: MaybeArray<string>;
}
export interface IUnitUnit {
	Unit: IUnitOptions;
	Install: IUnitInstallOptions;
}
