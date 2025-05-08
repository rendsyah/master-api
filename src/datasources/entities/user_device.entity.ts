import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'user_device' })
export class UserDevice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: null, nullable: true })
  user_id: number;

  @ManyToOne(() => User, (user) => user.user_device)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ type: 'varchar', length: 100, default: '' })
  firebase_id: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  device_imei: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  device_name: string;

  @Column({ type: 'varchar', length: 25, default: '' })
  device_os: string;

  @Column({ type: 'enum', enum: ['Web', 'Mobile'] })
  device_platform: string;

  @Column({ type: 'varchar', length: 10 })
  app_version: string;

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
}
