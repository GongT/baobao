export async function _lib_importer(id: string, promise: Promise<any>) {
	return promise.catch((e: any) => {
		console.error('无法载入模块 %s - %s', id, e);
		console.log(
			'%c可能由于package.json中的main设置有误，也可能是依赖的依赖无法载入（具体哪个模块可以运行build获取）',
			'color:red',
		);
		throw e;
	});
}
