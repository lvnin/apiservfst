/*
 * author: ninlyu.dev@outlook.com
 */
export default {
  isNumber(v: any): boolean {
    return 'number' === typeof v;
  },

  isNULL(v: any) {
    return v === null || v === undefined;
  },

  isString(v: any) {
    return 'string' === typeof v;
  },

  isArray(v: any) {
    return v instanceof Array;
  },

  isJSON(v: any) {
    try {
      return v instanceof Object || JSON.parse(v) instanceof Object;
    } catch (e) {
      return false;
    }
  },

  isObject(v: any) {
    return v instanceof Object;
  },

  isEmptyString(v: any) {
    return (
      v
        .replaceAll(' ', '')
        .replaceAll('\n', '')
        .replaceAll('\t', '')
        .replaceAll('\r', '') == ''
    );
  },
};
