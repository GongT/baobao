import pkgJson from '../../package.json' with { type: 'json' };

export const typescriptAlertHeader = `

// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore

/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * ${pkgJson.name} - The Simple Code Generater
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/

`.trim();
