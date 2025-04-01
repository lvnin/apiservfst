/*
 * author: ninlyu.dev@outlook.com
 */
import * as fs from 'fs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from '@/config';
import { ControllerMapping, ServiceMapping } from '@/mapping';

@Module({
  imports: [
    ClientsModule.register(
      config.microservices
        .filter((v: any) => !v.disabled)
        .map((v: any) => {
          if (v.transport === 'tcp') {
            return {
              name: v.name,
              transport: Transport.TCP,
              options: {
                host: v.host,
                port: v.port,
              },
            };
          } else if (v.transport === 'grpc') {
            const pkgs = v.protos.map(
              (protoPath: string) =>
                protoPath
                  .substring(protoPath.lastIndexOf('/') + 1)
                  .split('.')[0],
            );
            return {
              transport: Transport.GRPC,
              options: {
                package: pkgs,
                protoPath: v.protos.map((protoPath: string) =>
                  resolve(__dirname, protoPath),
                ),
                url: v.url,
              },
            };
          }
        }),
    ),
    JwtModule.register({
      secret: config.jwt.secret,
      signOptions: {
        issuer: config.jwt.issuer,
        expiresIn: config.jwt.expiresin,
      },
    }),
  ].concat(
    config.db.conns.map((v: any) => {
      return TypeOrmModule.forRootAsync({
        useFactory: async () => {
          // using the factory function to create the datasource instance
          try {
            const options = Object.assign(v, {
              entities: v.entities.map((v: any) => resolve(__dirname, v)),
              synchronize: config.db.synchronize,
              logging: config.db.logging,
            });

            const dataSource = new DataSource(options);
            await dataSource.initialize(); // initialize the data source

            if (config.db.synchronize && v.name === 'default') {
              // execute data-source.sql when data source is default
              const sql = fs.readFileSync(
                resolve(__dirname, config.db.sourcefile),
                'utf8',
              );
              const chumks = sql.split(/\n\s*\n/);
              for (let i = 0; i < chumks.length; i++) {
                if (chumks[i].length > 0) {
                  await dataSource.query(chumks[i]);
                }
              }
            }

            return options;
          } catch (error) {
            throw error;
          }
        },
      });
    }),
  ),
  controllers: ControllerMapping(),
  providers: ServiceMapping(),
})
export class AppModule {}
