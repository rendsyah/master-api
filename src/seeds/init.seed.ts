import { Knex } from 'knex';
import argon2 from '@node-rs/argon2';

export const seedInit = async (knex: Knex) => {
  const [accessCount, userCount] = await Promise.all([
    knex('user_access').first(),
    knex('user').first(),
  ]);

  if (!accessCount && !userCount) {
    const menuResult = knex('master_menu')
      .insert({
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        level: 1,
        header: 0,
        sort: 1,
      })
      .returning('*');

    const accessResult = knex('user_access')
      .insert({
        name: 'Administrator',
        description: 'Administrator Access',
      })
      .returning('*');

    await knex('user_access_detail').insert({
      access_id: +accessResult[0].id,
      menu_id: +menuResult[0].id,
      m_created: 1,
      m_updated: 1,
      m_deleted: 1,
    });

    const formatPass = await argon2.hash('admin');

    await knex('user').insert({
      access_id: +accessResult[0].id,
      username: 'admin',
      password: formatPass,
      fullname: 'Admin',
      email: 'admin@gmail.com',
      phone: '08123456789',
    });
  }
};
