import { DataSource } from 'typeorm';
import argon2 from '@node-rs/argon2';

import { MasterMenu, User, UserAccess, UserAccessDetail } from '../datasources/entities';

export const seedInit = async (dataSource: DataSource) => {
  const accessRepository = dataSource.getRepository(UserAccess);
  const userRepository = dataSource.getRepository(User);

  const [accessCount, userCount] = await Promise.all([
    accessRepository.count(),
    userRepository.count(),
  ]);

  if (accessCount === 0 && userCount === 0) {
    await dataSource.transaction(async (manager) => {
      const menuResult = await manager.getRepository(MasterMenu).insert({
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        level: 1,
        header: 0,
        sort: 1,
      });

      const accessResult = await manager.getRepository(UserAccess).insert({
        name: 'Administrator',
        description: 'Administrator Access',
        is_show: 0,
      });

      await manager.getRepository(UserAccessDetail).insert({
        access_id: +accessResult.generatedMaps[0].id,
        menu_id: +menuResult.generatedMaps[0].id,
        m_created: 1,
        m_updated: 1,
        m_deleted: 1,
      });

      const formatPass = await argon2.hash('admin');

      await manager.getRepository(User).insert({
        access_id: +accessResult.generatedMaps[0].id,
        username: 'admin',
        password: formatPass,
        fullname: 'Admin',
        email: 'admin@gmail.com',
        phone: '08123456789',
      });
    });
  }
};
