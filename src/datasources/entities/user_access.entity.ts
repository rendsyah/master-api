import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';
import { UserAccessDetail } from './user_access_detail.entity';

@Entity()
export class UserAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  path: string;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> branch menu, 1 -> all menu',
  })
  permission: number;

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

  @Column({ default: null, nullable: true })
  created_by: number;

  @ManyToOne(() => User, (user) => user.user_access_created)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  user_access_created_by: User;

  @Column({ default: null, nullable: true })
  updated_by: number;

  @ManyToOne(() => User, (user) => user.user_access_updated)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  user_access_updated_by: User;

  @Column({ default: null, nullable: true })
  deleted_by: number;

  @ManyToOne(() => User, (user) => user.user_access_deleted)
  @JoinColumn({ name: 'deleted_by', referencedColumnName: 'id' })
  user_access_deleted_by: User;

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

  @OneToMany(() => User, (user) => user.user_access)
  user: User[];

  @OneToMany(() => UserAccessDetail, (user_access_detail) => user_access_detail.user_access)
  user_access_detail: UserAccessDetail[];
}
