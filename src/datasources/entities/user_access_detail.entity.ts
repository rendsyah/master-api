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

import { MasterMenu } from './master_menu.entity';
import { UserAccess } from './user_access.entity';

@Entity({ name: 'user_access_detail' })
export class UserAccessDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  access_id: number;

  @ManyToOne(() => UserAccess, (user_access) => user_access.user_access_detail)
  @JoinColumn({ name: 'access_id', referencedColumnName: 'id' })
  user_access: UserAccess;

  @Column({ type: 'int', nullable: true })
  @Index()
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

  @Column({ type: 'int', default: null, nullable: true })
  @Index()
  created_by: number;

  @Column({ type: 'int', default: null, nullable: true })
  @Index()
  updated_by: number;

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
