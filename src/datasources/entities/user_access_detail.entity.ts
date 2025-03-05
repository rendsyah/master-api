import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MasterMenu } from './master_menu.entity';
import { User } from './user.entity';
import { UserAccess } from './user_access.entity';

@Entity()
export class UserAccessDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', default: null, nullable: true })
  access_id: number;

  @ManyToOne(() => UserAccess, (user_access) => user_access.user_access_detail)
  @JoinColumn({ name: 'access_id', referencedColumnName: 'id' })
  user_access: UserAccess;

  @Column({ type: 'int', default: null, nullable: true })
  menu_id: number;

  @ManyToOne(() => MasterMenu, (menu) => menu.user_access_detail)
  @JoinColumn({ name: 'menu_id', referencedColumnName: 'id' })
  menu: MasterMenu;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> not created, 1 -> created',
  })
  m_created: number;

  @Column({ type: 'smallint', default: 1, comment: '0 -> not view, 1 -> view' })
  m_view: number;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> not updated, 1 -> updated',
  })
  m_updated: number;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> not deleted, 1 -> deleted',
  })
  m_deleted: number;

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

  @ManyToOne(() => User, (user) => user.user_access_detail_created)
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  user_access_detail_created_by: User;

  @Column({ default: null, nullable: true })
  updated_by: number;

  @ManyToOne(() => User, (user) => user.user_access_detail_updated)
  @JoinColumn({ name: 'updated_by', referencedColumnName: 'id' })
  user_access_detail_updated_by: User;

  @Column({ default: null, nullable: true })
  deleted_by: number;

  @ManyToOne(() => User, (user) => user.user_access_detail_deleted)
  @JoinColumn({ name: 'deleted_by', referencedColumnName: 'id' })
  user_access_detail_deleted_by: User;

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
}
