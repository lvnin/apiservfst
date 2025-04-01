/*
 * author: ninlyu.dev@outlook.com
 */
import { config } from '@/config';

export const EmailTemplate = require(`./email.${config.app.locale}`).default;
