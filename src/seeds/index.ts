import AppDataSource from '../datasources/data-source';

import { seedInit } from './init.seed';

const runSeed = async () => {
  const dataSource = await AppDataSource.initialize();

  try {
    await seedInit(dataSource);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : String(error));
  } finally {
    await dataSource.destroy();
  }
};
void runSeed();
