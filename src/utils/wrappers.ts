/*
 * author: ninlyu.dev@outlook.com
 */
export class HttpWrapper {
  static async get(url: any, params: any, json = true) {
    if (params) {
      const paramsArray = [];
      Object.keys(params).forEach((key) =>
        paramsArray.push(key + '=' + params[key]),
      );
      if (url.search(/\?/) === -1) {
        url += '?' + paramsArray.join('&');
      } else {
        url += '&' + paramsArray.join('&');
      }
    }
    const res = await fetch(encodeURI(url));
    return res.ok ? (json ? res.json() : res.text()) : null;
  }

  static async post(url: any, data: any, headers: any) {
    const res = await fetch(url, {
      method: 'POST',
      body: data,
      headers: headers ? headers : { 'Content-Type': 'application/json' },
    });
    return res.ok ? res.json() : null;
  }
}

export class ResponseWrapper {
  static ok(data: any = null, errcode: any = { code: 0, message: '' }) {
    return {
      code: errcode.code,
      message: errcode.message,
      data,
    };
  }
  static fail(errcode: any, data: any = null) {
    return { ...errcode, data };
  }
}
