import { Knex } from 'knex';
import argon2 from '@node-rs/argon2';

export const seedInit = async (knex: Knex) => {
  const [accessCount, userCount] = await Promise.all([
    knex('user_access').first(),
    knex('user').first(),
  ]);

  if (!accessCount && !userCount) {
    const menu = knex('master_menu')
      .insert({
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'dashboard',
        level: 1,
        header: 0,
        sort: 1,
      })
      .returning('*');

    const access = knex('access')
      .insert({
        name: 'Administrator',
        description: 'Administrator Access',
      })
      .returning('*');

    await knex('user_access_detail').insert({
      access_id: +access[0].id,
      menu_id: +menu[0].id,
      m_created: 1,
      m_updated: 1,
      m_deleted: 1,
    });

    const hashed = await argon2.hash('admin');

    await knex('user').insert({
      access_id: +access[0].id,
      username: 'admin',
      password: hashed,
      fullname: 'Admin',
      email: 'admin@gmail.com',
      phone: '08123456789',
    });
  }
};
