import 'reflect-metadata';
import type { Knex } from 'knex';
import path from 'path';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: process.env.DB_TYPE,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    },
    migrations: {
      extension: 'ts',
      directory: path.resolve(__dirname, 'src/migrations'),
    },
    seeds: {
      extension: 'ts',
      directory: path.resolve(__dirname, 'src/seeds'),
    },
    useNullAsDefault: true,
  },
  production: {
    client: process.env.DB_TYPE,
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    },
    migrations: {
      directory: path.resolve(__dirname, '/src/migrations'),
    },
    seeds: {
      directory: path.resolve(__dirname, '/src/seeds'),
    },
    useNullAsDefault: true,
  },
};

export default config;
