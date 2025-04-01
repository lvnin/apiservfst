/*
 * author: ninlyu.dev@outlook.com
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user_blacklist')
export class UserBlacklistModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'user_id', comment: '拉黑者' })
  user: any;

  @Column({ type: 'int', name: 'member_id', comment: '被拉黑者' })
  member: any;

  @CreateDateColumn({
    name: 'created_at',
    type: 'datetime',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'datetime',
  })
  updatedAt: Date;

  @Column({ type: 'tinyint', default: 1 })
  status: number;
}
