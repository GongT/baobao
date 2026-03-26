import type { MenuProps } from 'antd';

export type MenuInfo = Parameters<NonNullable<MenuProps['onClick']>>[0];
