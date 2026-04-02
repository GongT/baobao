<!-- commit: 3ae33e89014be7739281a583ea7419f205c6a052 -->

## child_process/respawn

在 Linux pid/cgroup/mount 命名空间中重启当前进程

##### respawnInScope

在 Linux 命名空间隔离环境中重新启动当前 Node.js 进程; 应用逻辑必须放在 `mainFunc` 回调内

- `mainFunc`: 应用主函数
- 返回: 如果不需要重启(已在命名空间中、不支持、或设置了 `NEVER_UNSHARE` 环境变量), 直接调用 `mainFunc` 并返回 `undefined`; 否则通过 `execve` 替换当前进程(never返回)

使用 `unshare` 命令实现, 需要 Linux 环境; 非 root 用户自动添加 `--map-root-user` 参数

```typescript
import { respawnInScope } from '@idlebox/node';
respawnInScope(() => {
  import('./real-application');
});
```

<!-- spawnRecreateEventHandlers is deprecated
Type: () => void -->
<!-- trySpawnInScope is deprecated
Type: (cmds: string[]) => never -->
