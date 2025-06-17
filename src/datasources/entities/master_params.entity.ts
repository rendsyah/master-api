import {
  Column,
  CreateDateColumn,
  Entity,
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
  description: string;

  @Column({ type: 'varchar', length: 50 })
  value: string;

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
