/*
 * author: ninlyu.dev@outlook.com
 */
import { RouterController } from '@/router';
import { accountMapping } from '@scripts/account/mapping';

// ControllerMapping
export const ControllerMapping = () => {
  return [...[RouterController], ...accountMapping.controllers];
};

// ServiceMapping
export const ServiceMapping = () => {
  return [...accountMapping.services];
};
