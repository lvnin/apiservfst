/*
 * author: ninlyu.dev@outlook.com
 */
import { config } from '@/config';
import logger from '@utils/logger';
import { JPushAsync } from 'jpush-async';

class PushSdk {
  _client: any;

  constructor({ appKey, masterSecret, isDebug }) {
    this._client = JPushAsync.buildClient({ appKey, masterSecret, isDebug });
  }

  // notify - push通知
  // @param {number} userId
  // @param {string} [title]
  // @param {string} [content]
  // @returns
  notify(userId: number, { title, content }) {
    this._client
      .push()
      .setPlatform(JPushAsync.ALL)
      .setAudience(JPushAsync.alias(`${userId}`))
      .setNotification(
        JPushAsync.ios(content, 'sound', 0),
        JPushAsync.android(content, title),
      )
      .send()
      .then((result: any) => logger.debug(result))
      .catch((err: any) => logger.error(err));
  }
}

export const pushSdk = new PushSdk({
  appKey: config.sdk.push.appKey,
  masterSecret: config.sdk.push.masterSecret,
  isDebug: config.sdk.push.isDebug,
});
