/*
 * author: ninlyu.dev@outlook.com
 */
export default {
  CaptchaVerification: ({ email }) => ({
    to: [email],
    subject: '',
    html: '',
  }),
};
