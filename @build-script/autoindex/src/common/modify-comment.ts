import pkgJson from '../../package.json' with { type: 'json' };
export const headerComments = `
/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * ${pkgJson.name} - Automatic TypeScript index file generator
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/
`.trim();

export const linterInstructions = `
// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore
`.trim();
