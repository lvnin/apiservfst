/*
 * author: ninlyu.dev@outlook.com
 */
import { createHash } from 'crypto';

export const base64Secret = {
  /**
   * encode - base64加密
   * @param s string
   * @returns string
   */
  encode: (s: string) => {
    return Buffer.from(s).toString('base64');
  },
  /**
   * decode - base64解密
   * @param s string
   * @returns string
   */
  decode: (s: string) => {
    return Buffer.from(s, 'base64').toString();
  },
};

export const md5Secret = {
  /**
   * encode - md5加密
   * @param src string
   * @param bits number
   * @returns string
   */
  encode: (src: string, bits = 16) => {
    const s = createHash('md5').update(src).digest('hex');
    return bits === 32 ? s : s.substring(8, bits);
  },
};
