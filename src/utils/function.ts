/*
 * author: ninlyu.dev@outlook.com
 */

import IP2Region from 'ip2region';
import { base64Secret } from '@utils/security';
import shieldedFonts from '@constant/shielded_fonts';

/**
 * getClientIp - 获取客户端IP
 * @param req any
 * @returns
 */
export function getClientIp(req: any) {
  return req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.ip;
}

/**
 * ip2Region - 根据ip获取城市
 * @param req any
 * @returns string
 */
export const ip2Region = (req: any) => {
  const result = new IP2Region().search(getClientIp(req)); // { id: 2163, country: '中国', region: '华南', province: '广东省', city: '深圳市', isp: '阿里云' }
  return result.province.match(/省/g) == null
    ? result.province
    : result.province.substring(0, result.province.length - 1);
};

/**
 * sleep - 睡眠
 * @param delay number
 * @returns
 */
export function sleep(delay: number) {
  for (let t = Date.now(); Date.now() - t <= delay; );
}

/**
 * captchaCode - 生成验证码
 * @param size number
 * @returns
 */
export function captchaCode(size: number = 4) {
  let s = '';
  for (let i = 0; i < size; i++) {
    s += Math.floor(Math.random() * 10);
  }

  return s;
}

/**
 * conditionCode - 获取随机特征码
 * @param bits number
 * @returns
 */
export function conditionCode(bits: number = 12) {
  const random = (min: number, max: number) => {
    // [min, max)
    return Math.floor(Math.random() * (max - min)) + min;
  };

  const alphabetMap = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
    ],
    numberMap = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  let code = '';
  for (let i = 0; i < bits; i++) {
    code +=
      Math.random() < 0.7
        ? alphabetMap[random(0, alphabetMap.length)]
        : numberMap[random(0, numberMap.length)].toString();
  }

  return code;
}

/**
 * guid - 获取唯一码
 * @returns string
 */
export function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * random - 随机范围
 * @param min number
 * @param max number
 * @returns number
 */
export function random(min: number = 1, max: number = 100) {
  return Math.floor(Math.random() * (min - max)) + max;
}

/**
 * shuffle - 随机范围
 * @param array any[]
 * @returns
 */
export function shuffle(array: any[]) {
  let j: number, x: any, i: number;
  for (i = array.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = array[i - 1];
    array[i - 1] = array[j];
    array[j] = x;
  }
  return array;
}

/**
 * getStrSafety - 获取安全字符串（屏蔽字处理）
 * @param s string
 * @param isBase64 boolean
 */
export function getStrSafety(s: string, isBase64: boolean = false) {
  if (isBase64) {
    s = base64Secret.decode(s);
  }

  shieldedFonts.map((word: any) => {
    if (s.indexOf(word) > -1) {
      s = s.replace(word, ''.padStart(word.length, '*'));
    }
  });
  return s;
}

/**
 * objectMerge - 合并对象
 * @param srcObj any
 * @param dstObj any
 * @returns
 */
export function objectMerge(srcObj: any, dstObj: any) {
  const keys = Object.keys(dstObj);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] in srcObj) continue;
    srcObj[keys[i]] = dstObj[keys[i]];
  }
  return srcObj;
}

export class ColumnNumericTransformer {
  to(data: number): number {
    return data;
  }
  from(data: string): number {
    return parseFloat(data);
  }
}
