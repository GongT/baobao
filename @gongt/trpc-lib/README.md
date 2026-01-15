# library for [trpc](https://trpc.io/)


## socket-io link

复用socket-io的连接，执行trpc调用

```ts
// Client side
import { createTRPCClient } from '@trpc/client';
import { SocketIoLink } from '@gongt/trpc-lib/client';

const client = createTRPCClient({
  links: [
    SocketIoLink({
      url: 'ws://localhost:3000/socket.io/',
	  namespace: '/trpc',
    }),
  ],
});
```

```ts
// Server side
import { createSocketIoMiddleware } from '@gongt/trpc-lib/server';
import { initTRPC } from '@trpc/server';

const io = new SocketIO.Server({
	path: '/socket.io/',
	addTrailingSlash: true,
	transports: ['websocket', 'polling'],
});

export const trpc = initTRPC.context<XXX>().create({});
export const appRouter = trpc.router(...);

io.of('/trpc').use(
  createSocketIoMiddleware({
	router: appRouter,
  }),
);
```

## api-extractor

调用 [api-extractor](https://api-extractor.com/) 提取trpc的类型定义，生成客户端可用的类型文件，避免客户端依赖服务端。同时生成sourcemap保持调试友好

```sh
npx @gongt/trpc-lib extract ./lib/router.d.ts -o ../client/src/trpc-server-define.d.ts
```

说明:
1. 必须编译，不能直接使用ts文件（例如./src/router.ts）
1. 服务端`router.d.ts`中必须导出有且仅有一个 `BuiltRouter` 类型 （此类型来自 `@trpc/server`）
1. 输出文件将会`import type xxx from '@trpc/server'`，因此客户端需要安装 `@trpc/server` 依赖，不过这个项目并不依赖 `@types/node` 之类的定义，所以不会污染客户端类型
1. 如果源文件中存在 `import type xxx from '...'`，那么目标文件中也会存在相同的import语句，因此需要保证客户端也能找到这些类型定义，这些定义最好来自一个独立的包，否则提取操作没有意义
   1. *输出文件实际也可以放入独立协议包中*
