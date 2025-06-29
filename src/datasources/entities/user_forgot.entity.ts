import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity({ name: 'user_forgot' })
export class UserForgot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  user_id: number;

  @ManyToOne(() => User, (user) => user.user_forgot)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @Column({ unique: true, type: 'char', length: 6 })
  otp: string;

  @Column({ type: 'timestamp' })
  expired: Date | string;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> process, 1 -> success, 2 -> waiting, 3 -> expired',
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
