/**
 * 分辨 import.meta.env?.MODE 是否是 'production'
 * 需要编译工具支持 define replacement
 * 使用 import.meta.env.MODE 作为判断依据
 *
 * 当然也可以在运行时填充 import.meta.env
 * 
 * 对于大部分字符串替换类型的编译工具，需同时定义 import.meta.env?.MODE 和 import.meta.env.MODE
 * 
 * 以下工具无需设置:
 *   - vite
 */
export const isProductionMode: boolean = import.meta.env?.MODE === 'production';

/**
 * 分辨 import.meta.env?.PROD 是否存在
 * 需要编译工具支持 define replacement
 * 使用 import.meta.env.PROD 作为判断依据
 *
 * 当然也可以在运行时填充 import.meta.env
 * 
 * 对于大部分字符串替换类型的编译工具，需同时定义 import.meta.env?.PROD 和 import.meta.env.PROD
 *
 * 以下工具无需设置:
 *   - vite
 */
export const isBuildMode: boolean = !!import.meta.env?.PROD;
