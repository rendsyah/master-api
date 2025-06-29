import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'master_params' })
export class MasterParams {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  desc: string;

  @Column({ type: 'varchar', length: 100 })
  value: string;

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
