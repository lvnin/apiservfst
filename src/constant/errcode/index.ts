/*
 * author: ninlyu.dev@outlook.com
 */
import { config } from '@/config';

export const errcode = (s: string) => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(`./error.${config.app.locale}`).default[s];
};
