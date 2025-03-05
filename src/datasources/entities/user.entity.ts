import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { UserAccess } from './user_access.entity';
import { UserAccessDetail } from './user_access_detail.entity';
import { UserDevice } from './user_device.entity';
import { UserForgot } from './user_forgot.entity';
import { UserSession } from './user_session.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: null, nullable: true })
  access_id: number;

  @ManyToOne(() => UserAccess, (user_access) => user_access.user)
  @JoinColumn({ name: 'access_id', referencedColumnName: 'id' })
  user_access: UserAccess;

  @Column({ unique: true, type: 'varchar', length: 25 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @Column({ type: 'varchar', length: 100 })
  fullname: string;

  @Column({ type: 'varchar', length: 50 })
  email: string;

  @Column({ type: 'varchar', length: 25 })
  phone: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  image: string;

  @Column({
    type: 'smallint',
    default: 1,
    comment: '0 -> inactive, 1 -> active',
  })
  status: number;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> not deleted, 1 -> deleted',
  })
  is_deleted: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date | string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'NULL',
    nullable: true,
  })
  deleted_at: Date | string;

  @OneToMany(() => UserAccess, (user_access) => user_access.user_access_created_by)
  user_access_created: UserAccess[];

  @OneToMany(() => UserAccess, (user_access) => user_access.user_access_updated_by)
  user_access_updated: UserAccess[];

  @OneToMany(() => UserAccess, (user_access) => user_access.user_access_deleted_by)
  user_access_deleted: UserAccess[];

  @OneToMany(() => UserAccessDetail, (user_access) => user_access.user_access_detail_created_by)
  user_access_detail_created: UserAccessDetail[];

  @OneToMany(() => UserAccessDetail, (user_access) => user_access.user_access_detail_updated_by)
  user_access_detail_updated: UserAccessDetail[];

  @OneToMany(() => UserAccessDetail, (user_access) => user_access.user_access_detail_deleted_by)
  user_access_detail_deleted: UserAccessDetail[];

  @OneToMany(() => UserDevice, (user_device) => user_device.user)
  user_device: UserDevice[];

  @OneToMany(() => UserForgot, (user_forgot) => user_forgot.user)
  user_forgot: UserForgot[];

  @OneToMany(() => UserSession, (user_session) => user_session.user)
  user_session: UserSession[];
}
