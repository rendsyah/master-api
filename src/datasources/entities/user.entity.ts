import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { UserAccess } from './user_access.entity';
import { UserDevice } from './user_device.entity';
import { UserForgot } from './user_forgot.entity';
import { UserSession } from './user_session.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: null, nullable: true })
  @Index()
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

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  image: string;

  @Column({
    type: 'smallint',
    default: 1,
    comment: '0 -> inactive, 1 -> active',
  })
  status: number;

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

  @OneToMany(() => UserDevice, (user_device) => user_device.user)
  user_device: UserDevice[];

  @OneToMany(() => UserForgot, (user_forgot) => user_forgot.user)
  user_forgot: UserForgot[];

  @OneToMany(() => UserSession, (user_session) => user_session.user)
  user_session: UserSession[];
}
