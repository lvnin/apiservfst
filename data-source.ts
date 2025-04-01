import { config } from 'dotenv';
import { DataSource } from 'typeorm';

(() => {
  return config({ path: `.env.${process.env.NODE_ENV}` });
})();

export default new DataSource({
  type: 'mysql',
  host: process.env.TYPEORM_HOST,
  port: Number(process.env.TYPEORM_PORT),
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: ['src/scripts/model/**/*.ts'],
  migrations: ['src/migrations/**/*.ts'],
});
