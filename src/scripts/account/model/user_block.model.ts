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

// 屏蔽类型枚举
export const BlockTypeEnum = {};

@Entity('user_block')
export class UserBlockModel extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'blocker_id', comment: '屏蔽者' })
  blocker: any;

  @Column({ type: 'int', name: 'user_id', comment: '被屏蔽用户' })
  user: any;

  @Column({ name: 'type', comment: '屏蔽类型' })
  type: string;

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
