import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { resolve } from 'path';
// import { config as envConfig } from 'dotenv';

export const config = (() => {
  // return envConfig({ path: `.env.${process.env.NODE_ENV}` });
  return yaml.load(
    readFileSync(
      resolve(
        __dirname,
        `config/config.${
          process.env.NODE_ENV == 'development' ? 'dev' : 'prod'
        }.yaml`,
      ),
      'utf8',
    ),
  ) as Record<string, any>;
})();
