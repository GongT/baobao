/// <reference path="./meta.d.ts" />

export const isProductionMode = import.meta.env?.['MODE'] === 'production';
