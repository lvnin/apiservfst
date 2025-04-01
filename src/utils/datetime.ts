/*
 * author: ninlyu.dev@outlook.com
 */
import * as dayjs from 'dayjs';

export default {
  /**
   * now - 现在时间
   * @param isMs boolean
   * @returns number
   */
  now(isMs = true): number {
    const ms = new Date().getTime();
    return isMs ? ms : Math.floor(ms / 1000);
  },

  /**
   * parseDuration - 解析时长
   * @param d string
   * @param isMs boolean
   * @returns number
   */
  parseDuration(d: string, isMs: boolean = true): number {
    const index = d.indexOf('d');
    if (index > 0) {
      const day = Number(d.substring(0, index));
      const sec = day * 24 * 60 * 60;
      return isMs ? sec * 1000 : sec;
    } else {
      return 0;
    }
  },

  /**
   * format - 格式化时间
   * @param dt any | null
   * @param fmt string
   * @returns string
   */
  format(dt: any | null = null, fmt: string = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs(dt).format(fmt);
  },

  /**
   * timestamp - 获取时间戳
   * @param t any
   * @returns
   */
  timestamp(t: any) {
    return t ? new Date(t).getTime() : new Date().getTime();
  },

  date(t: any = new Date()) {
    return dayjs(t).format('YYYY-MM-DD');
  },

  time(t: any = new Date()) {
    return dayjs(t).format('HH:mm:ss');
  },
};
