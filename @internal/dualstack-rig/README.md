# 双栈包

需要依赖 heft-plugins，而heft-plugins又依赖不少本地包，所以这些包不能用dualstack-rig，以后可能实现自举，等到时候所有包都能用dualstack-rig了（也会同时改名）

不过这件事可能不会做，因为以后可能只需要module一种

含有两份配置：

-   default 编译两次分别生成cjs和module版本
-   all-in-one 用于库，比default多 生成index 和 api-extractor
