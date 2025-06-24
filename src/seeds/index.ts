import { knex } from 'knex';
import knexConfig from '../../knexfile';
import { seedInit } from './init.seed';

const runSeed = async () => {
  const datasource = knex(knexConfig[process.env.NODE_ENV || 'development']);

  try {
    await seedInit(datasource);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  } finally {
    await datasource.destroy();
  }
};
void runSeed();
