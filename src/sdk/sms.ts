/*
 * author: ninlyu.dev@outlook.com
 */
import { config } from '@/config';

class SmsSdk {
  async sendSms({ mobile, smsCode }) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RPCClient = require('@alicloud/pop-core').RPCClient;
    const smsCli = new RPCClient({
      accessKeyId: config.sdk.sms.accessKeyId,
      accessKeySecret: config.sdk.sms.accessKeySecret,
      endpoint: config.sdk.sms.endpoint,
      apiVersion: config.sdk.sms.apiVersion,
    });

    const params = {
        PhoneNumbers: mobile,
        SignName: config.sdk.sms.signName,
        TemplateCode: config.sdk.sms.templateCode,
        TemplateParam: JSON.stringify({ code: smsCode }),
      },
      requestOption = {
        method: 'POST',
      };

    return smsCli.request('SendSms', params, requestOption);
  }
}

export const smsSdk = new SmsSdk();
