# 命名管道读写

1. 在windows上使用 //./pipe/xxx
2. 在linux上使用FIFO

管道对方关闭时会触发本端的EOF，但这个包自动重连，隐藏了EOF的概念。

## Linux细节

由于nodejs不能调用同步的open函数，否则会彻底卡死node的核心fs线程。所以在linux上必须使用NONBLOCK。

作为读取端时没有任何问题。

但作为写入端时，如果没有读取端，open会返回ENXIO错误。

暂时用一个定时器重试实现。
